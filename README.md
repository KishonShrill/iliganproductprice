<a href="https://github.com/KishonShrill/iliganproductprice/blob/main/public/">
  <picture>
    <img src="./public/budgetbuddy.svg" width="100px" alt="nvm project logo" />
  </picture>
</a>


# 💸 Budget Buddy ![License](https://img.shields.io/badge/license-MIT-green) ![Vercel](https://img.shields.io/badge/hosted%20on-Vercel-black)


**Budget Buddy** is a simple and intuitive web app designed to help users manage their expenses, track their income, and stay on top of their budgets!  
Built with love using **Express.js**, **React.js**, and hosted on **Vercel**. 🧡

---

## ✨ Features

- 📊 **Have an estimate of your total spending**
- (more features to be added...)

---


## 🚀 Tech Stack

| Frontend         | Backend          | Hosting                   |
| :--------------- | :--------------- | :------------------------ |
| React.js         | Express.js       | Vercel (Frontend + API)   |
| HTML5            | Node.js          |                           |
| CSS3/SCSS        | MongoDB          |                           |

---

## 🛠️ Installation (Local Development)

If you want to run Budget Buddy locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/KishonShrill/iliganproductprice.git
cd iliganproductprice
```
### 2. Install frontend dependencies
```bash
npm install
```
### 3. Install backend dependencies - (Necessary only for testing)
```bash
cd ../server
npm install
```
### 4. Set up environment variables
Create a .env file on root folder and inquire repo owner for variables:
```env
# CONFIG VARIABLES
VITE_SCAN=false

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# MONGODB
HIDDEN_URI=your_mongodb_uri_here
```
and replace the value of `const uri =` to `process.env.HIDDEN_URI`

### 5. Run the app
To test the frontend:
```bash
npm run dev
```
To test the fullstack:
```bash
npm run start
```

## 🌍 Deployment
We use Vercel for hosting. Both the frontend and API routes are handled by Vercel.

## 📚 Project Structure
### Code Structure
```bash
budget-buddy/
├── public/     # Frontend public materials
│   └── UI/         # UI Icons
├── server/     # Express backend
│   └── auth.js     # For adding and editing product items
│   └── server.js   # Routes and everything backend in one place (will change this soon)
├── src/
│   └── assets/  
│   └── components/ # Frontend Components
│   └── contexts/  
│   └── hooks/      # Fetch hooks for backend
│   └── pages/      # Different file for different pages
│   └── styles/
│   └── App.jsx  
│   └── main.jsx    
├── README.md
├── package.json
└── vercel.json
```
### MongoDB Data
- **product_id** = `<year>-<incrementing-product-number>`
- **date_updated** = `<year>-<month>-<day>`
- **location_id** = Location ID points to the `_id` of location table to get the location name.
- **category_id** = Category ID points to the `_id` of category table to get the location name.
```json
{
  "_id": "<id_is_automatically_added_by_mongodb>",
  "product_id": "2024-0002",
  "product_name": "Catsan Light Cat Litter 3L",
  "category_id": "662a0a4fc8859ec225c0952c",
  "updated_price": 159.8,
  "date_updated": "2024-04-10",
  "location_id": "662666570ef9865c6431dcb1"
}
```
## 🙋‍♂️ [Contributing](./CONTRIBUTING.md)
Pull requests are welcome!

If you want to make improvements, open an issue first to discuss what you want to change.

- When contributing, put your name/username and github link in this format:
```md
CONTRIBUTION
- [<name/username>](<link-to-github>)
```

## 📜 License
This project is licensed under the [MIT License](./LICENSE).

