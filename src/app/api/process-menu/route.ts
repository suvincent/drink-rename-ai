/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import prisma from "@/lib/prisma";

// Helper function to convert base64 image data to a Generative Part
function fileToGenerativePart(dataUrl: string, mimeType: string): Part {
  // Extract base64 string from data URL
  const base64Data = dataUrl.split(',')[1];
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopName, rawMenuContent, imageData } = body;

    if (!shopName) {
      return NextResponse.json({ message: "店家名稱不能為空" }, { status: 400 });
    }

    if (!rawMenuContent && !imageData) {
      return NextResponse.json({ message: "請提供原始菜單內容或上傳圖片" }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ message: "GEMINI_API_KEY 未設定" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Changed model to gemini-pro-vision

    const textPrompt = `請解析以下菜單內容，並為每個品項提供成分名稱（說明飲料有哪些成分）、價格和說明。請以 JSON 陣列的格式返回，每個物件包含 originalName (原始名稱), newName (成分名稱), price (價格，數字), description (說明)。如果沒有價格或說明，請留空或為 null。簡化名稱請盡量簡潔易懂。`;

    const parts: Part[] = [];

    if (imageData) {
      // Assuming imageData is a data URL (e.g., data:image/png;base64,...)
      const mimeType = imageData.split(':')[1].split(';')[0];
      parts.push(fileToGenerativePart(imageData, mimeType));
      parts.push({ text: textPrompt + "\n\n菜單內容來自圖片。" });
    } else if (rawMenuContent) {
      parts.push({ text: textPrompt + "\n\n菜單內容：\n" + rawMenuContent });
    }

    // Add example JSON format to the prompt for better guidance
    parts.push({ text: `\n\n範例 JSON 格式：\n[
  {
    "originalName": "紅茶那堤",                                                                                                                         │
    "newName": "紅茶＋鮮奶", 
    "price": 35.0,
    "description": "經典紅茶，茶味濃郁"
  },
  {
    "originalName": "金萱青茶",                                                                                                                         │
    "newName": "青茶",                                                                                                                                  │
    "price": 40.0,                                                                                                                                      │
    "description": ""  
  },
  {                                                                                                                                                     │
    "originalName": "波霸鮮奶茶",                                                                                                                       │
    "newName": "波霸＋紅茶＋鮮奶",                                                                                                                      │
    "price": 40.0,                                                                                                                                      │
    "description": "清香紅茶，帶有花果香"                                                                                                               │
  }  
]
`});

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const response = await result.response;
    const text = response.text();

    let parsedMenuItems: any[];
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedMenuItems = JSON.parse(jsonMatch[1]);
      } else {
        parsedMenuItems = JSON.parse(text);
      }
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      console.error("Raw AI response text:", text);
      return NextResponse.json({ message: "AI 回應格式錯誤，無法解析菜單。" }, { status: 500 });
    }

    if (!Array.isArray(parsedMenuItems) || parsedMenuItems.length === 0) {
      return NextResponse.json({ message: "AI 未能解析出有效的菜單品項。" }, { status: 500 });
    }

    const resultDb = await prisma.$transaction(async (tx) => {
      const newShop = await tx.shop.upsert({
        where: { name: shopName },
        update: {},
        create: {
          name: shopName,
        },
      });

      const seenOriginalNames = new Set<string>();
      const uniqueParsedMenuItems = parsedMenuItems.filter((item: any) => {
        if (item.originalName && !seenOriginalNames.has(item.originalName)) {
          seenOriginalNames.add(item.originalName);
          return true;
        }
        return false;
      });

      const itemsToCreate = uniqueParsedMenuItems.map((item: any) => ({
        originalName: item.originalName,
        newName: item.newName || item.originalName,
        price: item.price || null,
        description: item.description || null,
        shopId: newShop.id,
      }));

      await tx.menuItem.createMany({
        data: itemsToCreate,
      });

      return newShop;
    });

    return NextResponse.json(resultDb, { status: 201 });

  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: `店家 "${error.meta?.target?.join(", ")}" 已經存在` }, { status: 409 });
    }
    console.error("API Error:", error);
    return NextResponse.json({ message: "伺服器發生錯誤或 AI 處理失敗" }, { status: 500 });
  }
}