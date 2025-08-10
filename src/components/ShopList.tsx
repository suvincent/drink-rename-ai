'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { useSession, signIn, signOut } from 'next-auth/react';

interface Shop {
  id: number;
  name: string;
  contributorCount?: number; // Add optional contributorCount
}

interface ShopListProps {
  initialShops: Shop[];
}

export default function ShopList({ initialShops }: ShopListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: session, status } = useSession();

  const filteredShops = initialShops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const header = (
    <div className="flex flex-col md:flex-row justify-content-between align-items-center gap-4">
      <h1 className="text-2xl font-bold">飲料店列表</h1>
      <div className="flex flex-col md:flex-row align-items-center gap-2">
        {status === "authenticated" ? (
          <>
            <span className="mr-2">歡迎, {session.user?.name || session.user?.email}!</span>
            <div className="flex gap-2">
              <Link href="/upload" passHref>
                <Button label="新增店家" icon="pi pi-plus" className="p-button-success" />
              </Link>
              <Button label="登出" icon="pi pi-sign-out" onClick={() => signOut()} className="p-button-danger" />
            </div>
          </>
        ) : (
          <>
            <Link href="/upload" passHref>
              <Button label="新增店家" icon="pi pi-plus" className="p-button-success" disabled />
            </Link>
            <Button label="登入" icon="pi pi-sign-in" onClick={() => signIn("google")} />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 flex flex-col gap-4">
      {/* Introduction Card */}
      <Card className="bg-white/30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">歡迎來到飲料白話文運動網站！</h2>
        <p className="mb-2">這個網站旨在幫助您將複雜的飲料名稱，轉換為簡單易懂的版本。</p>
        <p className="mb-2">主要功能包含：</p>
        <ul className="list-disc list-inside ml-4">
          <li>上傳菜單截圖或文字內容，AI 自動辨識並建議簡化名稱、價格與說明。</li>
          <li>管理您的飲料店家與菜單。</li>
          <li>搜尋店家與菜單品項。</li>
        </ul>
        <p className="mt-4">請登入以開始使用所有功能。</p>
      </Card>

      {/* Main Shop List Card */}
      <Card title={header} className="bg-white/30 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 md:p-6">
        <div className="mb-4">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search pl-3" />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋店家名稱..."
              className="w-full pl-6"
            />
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <Card key={shop.id} title={shop.name} className="mb-4 bg-white/50 backdrop-blur-sm border border-white/30 flex flex-col min-h-[180px] w-1/1 md:w-1/5">
                <div className="flex-grow">
                  {shop.contributorCount !== undefined && shop.contributorCount > 0 ? (
                    <span className="text-sm text-gray-600"><i className="pi pi-users mr-1" />貢獻者: {shop.contributorCount} 人</span>
                  ) : (
                    <span className="text-sm text-gray-600"><i className="pi pi-users mr-1" />尚無貢獻者</span>
                  )}
                </div>
                <div className="mt-auto text-right pt-2">
                  <Link href={`/shop/${shop.id}`} passHref>
                    <Button label="查看菜單" icon="pi pi-arrow-right" iconPos="right"  className="w-full"/>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <p>沒有找到符合條件的店家。</p>
          )}
        </div>
      </Card>
    </div>
  );
}