import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import { mockListings } from '../data/mockData';

const columns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'product', label: 'Product', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'views', label: 'Views', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions' },
];

export default function Listings() {

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Listings"
        actionLabel="Add Listing"
      />
      <div className="p-8">
        <DataTable
          data={mockListings}
          columns={columns}
        />
      </div>
    </div>
  );
}
