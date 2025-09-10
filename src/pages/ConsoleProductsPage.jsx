import { useMemo } from 'react';
import Header from '../components/console/Header';
import DataTable from '../components/DataTable';
import { mockProducts } from '../data/mockData';
import useFetchProducts from '../hooks/useFetchProducts';

const columns = [
  { key: 'product_id', label: 'Item ID', sortable: true },
  { key: 'product_name', label: 'Product Name', sortable: true },
  { key: 'category_name', label: 'Category', sortable: true },
  { key: 'category_list', label: 'Section', sortable: true },
  { key: 'actions', label: "Actions" }
];

export default function Products({ debugMode }) {

    const { isLoading, data, isError, error } = useFetchProducts()

    const normalizedData = data?.map(item => ({
        _id: item._id,
        product_id: item.product_id,
        product_name: item.product_name,
        imageUrl: item.imageUrl,
        category_list: item.category.list,
        category_name: item.category.name
    }))

    //  // Populate data for the category and location select inputs  
//    const { uniqueLocations, uniqueCategories } = useMemo(() => {
//        const locationsSet = new Set();
//        const categorySet = new Set();
//
//        data?.data.forEach(item => {
//            if (item.location?.name) locationsSet.add(item.location.name);
//            if (item.category?.name) categorySet.add(item.category.name);
//        });
//
//        //?? Output
//        console.log("Locations:", Array.from(locationsSet));
//        console.log("Categories:", Array.from(categorySet));
//
//        return {
//            uniqueLocations: Array.from(locationsSet),
//            uniqueCategories: Array.from(categorySet)
//        };
//    }, [data]);
    
    function add_product() {
        let url = debugMode
            ? 'http://localhost:5173/groceries/add-item'
            : 'https://productprice-iligan.vercel.app/groceries/add-item';
        window.location.href = url;
    }

    function edit_product(productId) {
        let location = debugMode
            ? `http://localhost:5173/groceries/edit-item?productId=${productId}&type=edit`
            : `https://productprice-iligan.vercel.app/groceries/edit-item?productId=${productId}&type=edit`;
        window.location.href = location;
    }

    //  const handleAddProduct = () => {
//    toast({
//      title: "Add Product",
//      description: "Add product functionality would be implemented here.",
//    });
//  };
//
//  const handleEdit = (product) => {
//    toast({
//      title: "Edit Product",
//      description: `Edit ${product.name} functionality would be implemented here.`,
//    });
//  };
//
//  const handleDelete = (product: Product) => {
//    toast({
//      title: "Delete Product",
//      description: `Delete ${product.name} functionality would be implemented here.`,
//      variant: "destructive",
//    });
//  };
//
//  const handleView = (product: Product) => {
//    toast({
//      title: "View Product",
//      description: `Viewing details for ${product.name}.`,
//    });
//  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 min-w-[320px]">
      <Header
        title="Products"
        actionLabel="Add Product"
        onAction={add_product}
      />
      <div className="p-8">
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
