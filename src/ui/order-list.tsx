// src/ui/order-list.tsx
"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define order type
type Order = {
	id: string;
	customer: string;
	date: string;
	total: number;
	status: "Completed" | "Processing" | "Shipped";
};

// Mock data for now (typed)
const orders: Order[] = [
	// keep empty for testing empty state
	// { id: "1", customer: "John Doe", date: "2023-05-01", total: 99.99, status: "Completed" },
];

export function OrderList() {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"All" | Order["status"]>("All");
	const [currentPage, setCurrentPage] = useState(1);
	const ordersPerPage = 5;

	// 🔎 Filter
	const filteredOrders = orders.filter(
		(order) =>
			(order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.includes(searchTerm)) &&
			(statusFilter === "All" || order.status === statusFilter),
	);

	// 📄 Pagination
	const indexOfLastOrder = currentPage * ordersPerPage;
	const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
	const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

	const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

	// 🚫 Empty state
	if (filteredOrders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-10 text-center">
				<p className="text-sm text-muted-foreground mb-4">No orders yet.</p>
				<Button asChild>
					<a href="/store">Go shopping</a>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
				<div className="relative w-full sm:w-64">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search orders..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-8"
					/>
				</div>

				<Select value={statusFilter} onValueChange={(val: "All" | Order["status"]) => setStatusFilter(val)}>
					<SelectTrigger className="w-full sm:w-40">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="All">All</SelectItem>
						<SelectItem value="Completed">Completed</SelectItem>
						<SelectItem value="Processing">Processing</SelectItem>
						<SelectItem value="Shipped">Shipped</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Table */}
			<div className="border rounded-md overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Order ID</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Total</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentOrders.map((order) => (
							<TableRow key={order.id}>
								<TableCell>{order.id}</TableCell>
								<TableCell>{order.customer}</TableCell>
								<TableCell>{order.date}</TableCell>
								<TableCell>${order.total.toFixed(2)}</TableCell>
								<TableCell>{order.status}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex justify-between items-center">
				<div className="text-sm text-muted-foreground">
					Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
					{filteredOrders.length} orders
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={currentPage === 1}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={currentPage === totalPages}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
