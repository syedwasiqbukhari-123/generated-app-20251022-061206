# Waterx
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/syedwasiqbukhari-123/generated-app-20251020-015111)
Waterx is a sophisticated, minimalist internal management system designed for the Waterx bottled water brand. It streamlines daily operations by providing role-based access for Admins, Managers, and Drivers. The platform features a comprehensive dashboard, inventory and bottle tracking, customer and order management, delivery logistics, financial tracking, and employee administration. The user interface is designed to be visually stunning, clean, and intuitive, with a blue and white color palette, soft animations, and a focus on user delight, ensuring a seamless and efficient workflow for the entire team.
## Key Features
-   **Role-Based Access Control:** Tailored dashboards and permissions for Admins, Managers, and Drivers.
-   **Comprehensive Dashboard:** At-a-glance statistics, sales trends, and key performance indicators.
-   **Inventory Management:** Track product stock, bottle circulation (full, empty, defective), and receive low-stock alerts.
-   **Customer & Order Management:** Full CRUD for customer profiles, order history, and bottle balances.
-   **Delivery Logistics:** Simplified view for drivers to manage assigned routes and update delivery statuses.
-   **Financial Tracking:** Monitor revenue, expenses, and outstanding payments with reporting and data export capabilities.
-   **Employee Administration:** Admin-only section for managing employee accounts, roles, and performance.
-   **Data Export:** Export key data (customers, orders, inventory, finance) to CSV/Excel.
## Technology Stack
-   **Frontend:** React, Vite, TypeScript, Tailwind CSS
-   **UI Components:** shadcn/ui, Lucide React
-   **State Management:** Zustand
-   **Routing:** React Router
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Data Visualization:** Recharts
-   **Animations:** Framer Motion
-   **Notifications:** Sonner
## Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/waterx.git
    cd waterx
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
### Running the Development Server
To start the local development server, which includes both the Vite frontend and the Hono backend worker, run:
```bash
bun dev
```
The application will be available at `http://localhost:3000`.
## Development
The project is structured into three main parts:
-   `src/`: Contains the React frontend application code.
-   `worker/`: Contains the Hono backend code running on Cloudflare Workers.
-   `shared/`: Contains TypeScript types shared between the frontend and backend for end-to-end type safety.
### Backend Development
-   API routes are defined in `worker/user-routes.ts`.
-   Data models (Entities) are defined in `worker/entities.ts`, which abstract interactions with the Durable Object.
### Frontend Development
-   Pages are located in `src/pages/`.
-   Reusable components are in `src/components/`.
-   The application uses a type-safe API client in `src/lib/api-client.ts` to communicate with the backend.
## Deployment
This application is designed for easy deployment to the Cloudflare network.
1.  **Login to Wrangler:**
    ```bash
    wrangler login
    ```
2.  **Build and Deploy:**
    The `deploy` script in `package.json` handles building the Vite application and deploying the worker.
    ```bash
    bun deploy
    ```
This command will deploy your application, and Wrangler will output the URL where it is live.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/syedwasiqbukhari-123/generated-app-20251020-015111)