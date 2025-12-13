"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/core/components/ui/alert-dialog";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { authClient } from "@/core/lib/auth/client";
import { MoreHorizontal, Plus, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
	id: string;
	name: string | null;
	email: string;
	role: string | undefined;
	banned: boolean | null;
	banReason: string | null;
	createdAt: Date;
}

export default function UserManagementPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Form states
	const [newUser, setNewUser] = useState({
		email: "",
		password: "",
		name: "",
		role: "user"
	});

	const [editUser, setEditUser] = useState({
		name: "",
		role: ""
	});

	const [banReason, setBanReason] = useState("");

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			const response = await authClient.admin.listUsers({
				query: {
					limit: 100
				}
			});

			if (response.data) {
				setUsers(response.data.users as User[]);
			}
		} catch (error) {
			toast.error("Failed to load users");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateUser = async () => {
		try {
			const response = await authClient.admin.createUser({
				email: newUser.email,
				password: newUser.password,
				name: newUser.name,
				role: newUser.role as "user" | "admin" | "moderator"
			});

			if (response.data) {
				toast.success("User created successfully");
				setIsCreateDialogOpen(false);
				setNewUser({ email: "", password: "", name: "", role: "user" });
				loadUsers();
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to create user");
		}
	};

	const handleUpdateUser = async () => {
		if (!selectedUser) return;

		try {
			await authClient.admin.updateUser({
				userId: selectedUser.id,
				data: {
					name: editUser.name,
					role: editUser.role
				}
			});

			toast.success("User updated successfully");
			setIsEditDialogOpen(false);
			loadUsers();
		} catch (error: any) {
			toast.error(error.message || "Failed to update user");
		}
	};

	const handleBanUser = async () => {
		if (!selectedUser) return;

		try {
			await authClient.admin.banUser({
				userId: selectedUser.id,
				banReason: banReason || undefined
			});

			toast.success("User banned successfully");
			setIsBanDialogOpen(false);
			setBanReason("");
			loadUsers();
		} catch (error: any) {
			toast.error(error.message || "Failed to ban user");
		}
	};

	const handleUnbanUser = async (userId: string) => {
		try {
			await authClient.admin.unbanUser({
				userId
			});

			toast.success("User unbanned successfully");
			loadUsers();
		} catch (error: any) {
			toast.error(error.message || "Failed to unban user");
		}
	};

	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		try {
			await authClient.admin.removeUser({
				userId: selectedUser.id
			});

			toast.success("User deleted successfully");
			setIsDeleteDialogOpen(false);
			loadUsers();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete user");
		}
	};

	const openEditDialog = (user: User) => {
		setSelectedUser(user);
		setEditUser({
			name: user.name || "",
			role: user.role as "user"
		});
		setIsEditDialogOpen(true);
	};

	const openBanDialog = (user: User) => {
		setSelectedUser(user);
		setIsBanDialogOpen(true);
	};

	const openDeleteDialog = (user: User) => {
		setSelectedUser(user);
		setIsDeleteDialogOpen(true);
	};

	const filteredUsers = users.filter(user =>
		user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return <div className="flex justify-center items-center h-64">Loading...</div>;
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">User Management</h1>
					<p className="text-muted-foreground mt-2">
						Manage user accounts, roles, and permissions.
					</p>
				</div>

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Create User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
							<DialogDescription>
								Add a new user to the system with specified role and permissions.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="email" className="text-right">Email</Label>
								<Input
									id="email"
									type="email"
									value={newUser.email}
									onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="password" className="text-right">Password</Label>
								<Input
									id="password"
									type="password"
									value={newUser.password}
									onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">Name</Label>
								<Input
									id="name"
									value={newUser.name}
									onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="role" className="text-right">Role</Label>
								<Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
									<SelectTrigger className="col-span-3">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="user">User</SelectItem>
										<SelectItem value="moderator">Moderator</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleCreateUser}>Create User</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search users by email or name..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Users ({filteredUsers.length})</CardTitle>
					<CardDescription>
						Manage all user accounts in the system.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.name || "No name"}
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge variant={
											user.role === "admin" ? "destructive" :
											user.role === "moderator" ? "secondary" : "outline"
										}>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										{user.banned ? (
											<Badge variant="destructive">Banned</Badge>
										) : (
											<Badge variant="secondary">Active</Badge>
										)}
									</TableCell>
									<TableCell>
										{new Date(user.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem onClick={() => openEditDialog(user)}>
													Edit User
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{user.banned ? (
													<DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
														<UserCheck className="h-4 w-4 mr-2" />
														Unban User
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem onClick={() => openBanDialog(user)}>
														<UserX className="h-4 w-4 mr-2" />
														Ban User
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => openDeleteDialog(user)}
													className="text-destructive"
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete User
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Edit User Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Update user information and role.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-name" className="text-right">Name</Label>
							<Input
								id="edit-name"
								value={editUser.name}
								onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-role" className="text-right">Role</Label>
							<Select value={editUser.role || "user"} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
								<SelectTrigger className="col-span-3">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="moderator">Moderator</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={handleUpdateUser}>Update User</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Ban User Dialog */}
			<Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							Ban the user from accessing the system. This will revoke all active sessions.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="ban-reason" className="text-right">Reason</Label>
							<Input
								id="ban-reason"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="Optional ban reason"
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="destructive" onClick={handleBanUser}>Ban User</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete User Dialog */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the user
							account and remove all associated data from the system.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
