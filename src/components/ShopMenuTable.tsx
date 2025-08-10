/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  originalName: string;
  newName: string;
  price?: number | null;
  description?: string | null;
}

interface ShopMenuTableProps {
  items: MenuItem[];
}

export default function ShopMenuTable({ items }: ShopMenuTableProps) {
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const toast = useRef<Toast>(null);
  const router = useRouter();

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  const onRowEditComplete = async (e: any) => {
    const _menuItems = [...menuItems];
    const { newData, index } = e;

    _menuItems[index] = newData;

    try {
      const response = await fetch(`/api/menu-items/${newData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error('Failed to update menu item');
      }

      setMenuItems(_menuItems);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Menu item updated', life: 3000 });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update menu item', life: 3000 });
    }
  };

  const textEditor = (options: any) => {
    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };

  const priceEditor = (options: any) => {
    return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="TWD" locale="zh-TW" />;
  };

  const priceBodyTemplate = (rowData: MenuItem) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(rowData.price || 0);
  };

  const header = (
    <div className="flex justify-content-end">
      <span className="p-input-icon-left">
        <i className="pi pi-search pl-3" />
        <InputText
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          className="w-full pl-6"
          placeholder="搜尋菜單品項..."
        />
      </span>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={menuItems}
        paginator
        rows={10}
        emptyMessage="這個店家沒有菜單品項。"
        header={header}
        globalFilter={globalFilterValue}
        editMode={session ? "row" : undefined}
        onRowEditComplete={onRowEditComplete}
      >
        <Column field="originalName" header="原始名稱" sortable editor={(options) => textEditor(options)} style={{ width: '20%' }}></Column>
        <Column field="newName" header="簡化名稱" sortable editor={(options) => textEditor(options)} style={{ width: '20%' }}></Column>
        <Column field="price" header="價格" body={priceBodyTemplate} sortable editor={(options) => priceEditor(options)} style={{ width: '15%' }}></Column>
        <Column field="description" header="說明" sortable editor={(options) => textEditor(options)} style={{ width: '35%' }}></Column>
        {session && <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>}
      </DataTable>
    </>
  );
}
