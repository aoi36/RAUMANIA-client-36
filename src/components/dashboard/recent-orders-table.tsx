import { format } from "date-fns"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RecentOrder {
  id: string
  customerName: string | null
  orderDate: string
  totalAmount: number
  status: string
  paymentStatus: string
}

interface RecentOrdersTableProps {
  orders: RecentOrder[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                <TableCell>{order.customerName || "Anonymous"}</TableCell>
                <TableCell>{format(new Date(order.orderDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                <Badge
                    variant={
                        order.status === "COMPLETED"
                        ? "success"
                        : order.status === "PENDING"
                        ? "secondary" // Or "default" depending on your styling
                        : order.status === "CANCELLED"
                        ? "destructive"
                        : "default"
                    }
                    >
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                <Badge
                    variant={
                        order.paymentStatus === "COMPLETED"
                        ? "success"
                        : order.paymentStatus === "PENDING"
                        ? "secondary" // Or "default" or "outline" depending on your design
                        : order.paymentStatus === "FAILED"
                        ? "destructive"
                        : "default"
                    }
                    >
                    {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}