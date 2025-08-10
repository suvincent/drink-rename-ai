'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image'; // Import Image component

export default function UploadPage() {
  const [shopName, setShopName] = useState('');
  const [rawMenuContent, setRawMenuContent] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const { data: session, status } = useSession(); // eslint-disable-line @typescript-eslint/no-unused-vars

  if (status === "loading") {
    return <div className="p-8 text-center">載入中...</div>;
  }

  if (status === "unauthenticated") {
    signIn("google", {redirect: false}); // Use signIn function
    return null; // Or a loading spinner/message
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRawMenuContent(''); // Clear text content if image is selected
    } else {
      setImageData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!shopName.trim()) {
        toast.current?.show({ severity: 'warn', summary: 'Warning', detail: '店家名稱不能為空' });
        setIsLoading(false);
        return;
    }

    if (!rawMenuContent.trim() && !imageData) {
        toast.current?.show({ severity: 'warn', summary: 'Warning', detail: '請提供原始菜單內容或上傳圖片' });
        setIsLoading(false);
        return;
    }

    try {
      const payload = {
        shopName,
        rawMenuContent: rawMenuContent.trim() || null, // Send null if empty
        imageData: imageData || null, // Send null if empty
      };

      const response = await fetch('/api/process-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: '店家與菜單已成功處理！' });
        setTimeout(() => router.push('/'), 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '發生未知錯誤');
      }
    } catch (error: unknown) { // Changed to unknown
        let errorMessage = '發生未知錯誤';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message; // Type assertion for object with message
        }
        toast.current?.show({ severity: 'error', summary: 'Error', detail: errorMessage });
        setIsLoading(false);
    }
  };

  return (
    <>
    <Toast ref={toast} />
    <div className="p-4 md:p-8 flex justify-center items-start">
      <Card title="新增飲料店與菜單" className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="shopName" className="font-bold block mb-2">店家名稱</label>
            <InputText
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="例如：可不可熟成紅茶"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="imageUpload" className="font-bold block mb-2">上傳菜單截圖 (可選)</label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {imageData && (
              <div className="mt-4">
                <p className="mb-2">圖片預覽:</p>
                <Image src={imageData} alt="Menu Preview" width={300} height={200} style={{ objectFit: 'contain' }} className="max-w-full h-auto rounded" />
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">上傳圖片後，文字內容將會被忽略。</p>
          </div>

          <div className="text-center text-gray-600 font-bold">或</div>

          <div>
            <label htmlFor="rawMenuContent" className="font-bold block mb-2">原始菜單內容 (直接貼上)</label>
            <InputTextarea
              id="rawMenuContent"
              value={rawMenuContent}
              onChange={(e) => {
                setRawMenuContent(e.target.value);
                setImageData(null); // Clear image data if text is entered
              }}
              rows={10}
              placeholder="請在此貼上完整的原始菜單內容，例如：

熟成紅茶 M$35 L$40
麗春紅茶 M$40 L$45
熟成歐蕾 M$55 L$60
..."
              className="w-full"
              autoResize
              disabled={!!imageData} // Disable if image is selected
            />
            <p className="text-sm text-gray-500 mt-2">如果上傳了圖片，此區內容將會被忽略。</p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label={isLoading ? '處理中...' : '確認新增'}
              icon="pi pi-check"
              disabled={isLoading}
            />
          </div>
        </form>
      </Card>
    </div>
    </>
  );
}
