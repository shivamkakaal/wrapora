import CustomersManager from "@/components/admin/CustomersManager";
import { fetchAggregatedCustomers } from "@/lib/services/customer_service";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customersList = await fetchAggregatedCustomers();
  return <CustomersManager initialCustomers={customersList} />;
}

