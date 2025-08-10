'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

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
  const [globalFilterValue, setGlobalFilterValue] = useState('');

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
          className="w-full pl-6" // Added pl-6 here
          placeholder="搜尋菜單品項..."
        />
      </span>
    </div>
  );

  return (
    <DataTable
      value={items}
      paginator
      rows={10}
      emptyMessage="這個店家沒有菜單品項。"
      header={header}
      globalFilter={globalFilterValue}
    >
      <Column field="originalName" header="原始名稱" sortable style={{ width: '20%' }}></Column>
      <Column field="newName" header="簡化名稱" sortable style={{ width: '20%' }}></Column>
      <Column field="price" header="價格" body={priceBodyTemplate} sortable style={{ width: '15%' }}></Column>
      <Column field="description" header="說明" sortable style={{ width: '45%' }}></Column>
    </DataTable>
  );
}