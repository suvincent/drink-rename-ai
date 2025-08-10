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
    <div className="flex justify-content-between align-items-center">
      <h1 className="text-2xl font-bold">飲料店列表</h1>
      <div className="flex align-items-center gap-2">
        {status === "authenticated" ? (
          <>
            <span className="mr-2">歡迎, {session.user?.name || session.user?.email}!</span>
            <Link href="/upload" passHref>
              <Button label="新增店家" icon="pi pi-plus" className="p-button-success" />
            </Link>
            <Button label="登出" icon="pi pi-sign-out" onClick={() => signOut()} className="p-button-danger" />
          </>
        ) : (
          <>
            <Link href="/upload" passHref>
              <Button label="新增店家" icon="pi pi-plus" className="p-button-success" disabled />
            </Link>
            <Button label="登入" icon="pi pi-sign-in" onClick={() => signIn("google", {redirect: false})} />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <Card title={header}>
        <div className="mb-4">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search pl-3" />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋店家名稱..."
              className="w-full pl-6" // Added pl-6 here
            />
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <Card key={shop.id} title={shop.name} className="mb-4">
                <div className="flex justify-end">
                  <Link href={`/shop/${shop.id}`} passHref>
                    <Button label="查看菜單" icon="pi pi-arrow-right" iconPos="right" />
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