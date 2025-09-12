import { useNavigate } from 'react-router-dom';
import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import useFetchProducts from '../hooks/useFetchProducts';

const columns = [
  { key: 'product_id', label: 'Item ID', sortable: true },
  { key: 'product_name', label: 'Product Name', sortable: true },
  { key: 'category_name', label: 'Category', sortable: true },
  { key: 'category_list', label: 'Section', sortable: true },
  { key: 'status', label: 'hasImage' },
  { key: 'actions', label: "Actions" }
];

export default function Products({ debugMode }) {
    document.title = "BB:Console - Products"
    const navigate = useNavigate();
    const { isLoading, data, isError, error } = useFetchProducts()

    const normalizedData = data?.map(item => ({
        _id: item._id,
        product_id: item.product_id,
        product_name: item.product_name,
        status: item.imageUrl ? "active" : "inactive",
        image: item.imageUrl,
        category_list: item.category.list,
        category_name: item.category.name
    }))
    
    function add_product() {
        navigate('/dev-mode/products/new');
    }

    function edit_product(productId) {
        let location = debugMode
            ? `http://localhost:5173/groceries/edit-item?productId=${productId}&type=edit`
            : `https://productprice-iligan.vercel.app/groceries/edit-item?productId=${productId}&type=edit`;
        window.location.href = location;
    }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 min-w-[320px]">
      <Header
        title="Products"
        actionLabel="Add Product"
        onAction={add_product}
      />
      <div className="p-4 md:p-8">
        { isLoading 
            ? <h1>Loading...</h1> 
            : <DataTable
                fetched={"products"}
                data={normalizedData}
                columns={columns}
                onEdit={edit_product}
            />
        }
      </div>
    </div>
  );
}
