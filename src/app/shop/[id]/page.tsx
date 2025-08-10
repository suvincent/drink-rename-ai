/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import Link from 'next/link';
import { Button } from 'primereact/button';
import ShopMenuTable from '../../../components/ShopMenuTable';
import { confirmPopup } from 'primereact/confirmpopup'; // Added confirmPopup from primereact/api
import { Toast } from 'primereact/toast';
import { useSession } from 'next-auth/react'; // Import useSession

// This component is now a Client Component
export default function ShopPage({ params }: any) {
  const { id }: any = use(params); // ✅ unwrap Promise
  const shopId = parseInt(id, 10);
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const { data: session, status } = useSession(); // Get session data

  // State to hold shop data fetched from an API route
  const [shop, setShop] = useState<any>(null); // Using any for simplicity, ideally define Shop type
  const [loading, setLoading] = useState(true);

  // Fetch shop data on component mount
  // This is a simplified client-side fetch. In a real app, you might use SWR or React Query
  // or pass initial data from a Server Component.
  // For this example, we'll fetch client-side for simplicity after making it a client component.
  useEffect(() => {
    const fetchShop = async () => {
      if (isNaN(shopId)) {
        router.push('/404');
        return;
      }
      try {
        const response = await fetch(`/api/shops/${shopId}`);
        if (!response.ok) throw new Error('Shop not found');
        const data = await response.json();
        setShop(data);
      } catch (error) {
        console.error('Failed to fetch shop:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };
  
    fetchShop();
  }, [shopId, router]);

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email); // Check if user is admin

  const deleteShop = async () => {
    if (!isAdmin) {
      toast.current?.show({ severity: 'error', summary: '錯誤', detail: '您沒有權限刪除店家。' });
      return;
    }
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.current?.show({ severity: 'success', summary: '成功', detail: '店家已成功刪除！' });
        setTimeout(() => router.push('/'), 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '刪除失敗');
      }
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: '錯誤', detail: error.message });
    }
  };

  const confirmDeleteShop = (event: React.MouseEvent) => {
    confirmPopup({
      target: event.currentTarget as HTMLElement,
      message: '您確定要刪除這間店家及其所有菜單品項嗎？此操作無法復原。',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '是，刪除',
      rejectLabel: '否',
      accept: deleteShop,
    });
  };

  if (loading) {
    return <div className="p-8 text-center">載入中...</div>;
  }

  if (!shop) {
    return <div className="p-8 text-center">店家未找到。</div>;
  }

  const header = (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-center md:text-left">{shop.name} - 菜單</h1>
        <div className="flex gap-2">
            <Link href="/" passHref>
                <Button label="返回列表" icon="pi pi-arrow-left" className="p-button-secondary" />
            </Link>
            {status === "authenticated" && isAdmin && (
                <Button
                    label="刪除店家"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={confirmDeleteShop}
                />
            )}
        </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      {/* ConfirmDialog is removed from here */}
      <div className="p-4 md:p-8">
        <Card title={header}>
          <ShopMenuTable items={shop.items} />
        </Card>
      </div>
    </>
  );
}