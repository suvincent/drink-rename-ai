'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

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
  const priceBodyTemplate = (rowData: MenuItem) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(rowData.price || 0);
  };

  return (
    <DataTable value={items} paginator rows={10} emptyMessage="這個店家沒有菜單品項。">
      <Column field="originalName" header="原始名稱" sortable style={{ width: '20%' }}></Column>
      <Column field="newName" header="簡化名稱" sortable style={{ width: '20%' }}></Column>
      <Column field="price" header="價格" body={priceBodyTemplate} sortable style={{ width: '15%' }}></Column>
      <Column field="description" header="說明" sortable style={{ width: '45%' }}></Column>
    </DataTable>
  );
}
