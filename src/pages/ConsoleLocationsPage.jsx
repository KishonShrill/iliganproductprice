import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import { mockLocations } from '../data/mockData';

const columns = [
  { key: 'name', label: 'Location Name', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  { key: 'state', label: 'State', sortable: true },
  { key: 'zipCode', label: 'Zip Code' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions' },
];

export default function Locations() {
//  const handleAddLocation = () => {
//    toast({
//      title: "Add Location",
//      description: "Add location functionality would be implemented here.",
//    });
//  };
//
//  const handleEdit = (location: Location) => {
//    toast({
//      title: "Edit Location",
//      description: `Edit ${location.name} functionality would be implemented here.`,
//    });
//  };
//
//  const handleDelete = (location: Location) => {
//    toast({
//      title: "Delete Location",
//      description: `Delete ${location.name} functionality would be implemented here.`,
//      variant: "destructive",
//    });
//  };
//
//  const handleView = (location: Location) => {
//    toast({
//      title: "View Location",
//      description: `Viewing details for ${location.name}.`,
//    });
//  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Locations"
        actionLabel="Add Location"
      />
      <div className="p-8">
        <DataTable
          data={mockLocations}
          columns={columns}
        />
      </div>
    </div>
  );
}
