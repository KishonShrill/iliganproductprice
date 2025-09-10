import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import useFetchLocations from '../hooks/useFetchLocations';

const columns = [
  { key: 'name', label: 'Location Name', sortable: true },
  { key: 'address', label: 'Address' },
  { key: 'store_hours', label: 'Store Hours' },
  { key: 'status', label: '24 Hours', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'actions', label: 'Actions' },
];

export default function Locations() {

    const { isLoading, data, isError, error } = useFetchLocations()

    const normalizedData = data?.map(item => ({
        _id: item._id,
        name: item.location_name,
        address: `${item.address.street}, ${item.address.barangay}, ${item.address.city}`,
        map: item.coordinates,
        store_hours: `${item.store_hours.open} - ${item.store_hours.close}`,
        status: item.is_open_24hrs,
        type: item.type
    }))

    const handleView = (location) => {
        window.open(location.map, '_blank').focus();
    };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Locations"
        actionLabel="Add Location"
      />
      <div className="p-8">
      { isLoading 
          ? <h1>Loading...</h1>
          : <DataTable
          fetched={"locations"}
          data={normalizedData}
          columns={columns}
          onView={handleView}
        />
      }
      </div>
    </div>
  );
}
