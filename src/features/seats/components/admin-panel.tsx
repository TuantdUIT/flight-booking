"use client";

import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Switch } from "@/core/components/ui/switch";
import { useCreateSeat, useUpdateSeat, useDeleteSeat } from "../hooks/use-seats";
import type { Seat } from "@/core/types/seat";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface AdminPanelProps {
  flightId: number;
  seats: Seat[];
  onClose: () => void;
}

type EditMode = "create" | "edit" | null;

export function AdminPanel({ flightId, seats, onClose }: AdminPanelProps) {
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  
  const [seatNumber, setSeatNumber] = useState("");
  const [seatClass, setSeatClass] = useState<"economy" | "business">("economy");
  const [isAvailable, setIsAvailable] = useState(true);
  const [price, setPrice] = useState("");

  const createSeat = useCreateSeat();
  const updateSeat = useUpdateSeat();
  const deleteSeat = useDeleteSeat();

  const resetForm = () => {
    setSeatNumber("");
    setSeatClass("economy");
    setIsAvailable(true);
    setPrice("");
    setSelectedSeat(null);
    setEditMode(null);
  };

  const handleCreate = () => {
    setEditMode("create");
    resetForm();
  };

  const handleEdit = (seat: Seat) => {
    setEditMode("edit");
    setSelectedSeat(seat);
    setSeatNumber(seat.seat_number);
    setSeatClass(seat.class);
    setIsAvailable(seat.is_available);
    setPrice(seat.price);
  };

  const handleDelete = async (seat: Seat) => {
    if (!confirm(`Delete seat ${seat.seat_number}?`)) return;
    
    try {
      await deleteSeat.mutateAsync({ id: seat.id, flightId });
      toast.success(`Seat ${seat.seat_number} deleted`);
    } catch (error) {
      toast.error("Failed to delete seat");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seatNumber || !price) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editMode === "create") {
        await createSeat.mutateAsync({
          flight_id: flightId,
          seat_number: seatNumber.toUpperCase(),
          class: seatClass,
          is_available: isAvailable,
          price,
        });
        toast.success(`Seat ${seatNumber} created`);
      } else if (editMode === "edit" && selectedSeat) {
        await updateSeat.mutateAsync({
          id: selectedSeat.id,
          flightId,
          seat_number: seatNumber.toUpperCase(),
          class: seatClass,
          is_available: isAvailable,
          price,
        });
        toast.success(`Seat ${seatNumber} updated`);
      }
      resetForm();
    } catch (error) {
      toast.error(editMode === "create" ? "Failed to create seat" : "Failed to update seat");
    }
  };

  const isLoading = createSeat.isPending || updateSeat.isPending || deleteSeat.isPending;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Admin Panel</CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editMode && (
          <Button onClick={handleCreate} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New Seat
          </Button>
        )}

        {editMode && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm">
              {editMode === "create" ? "Create Seat" : `Edit ${selectedSeat?.seat_number}`}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="seatNumber" className="text-xs">Seat Number</Label>
                <Input
                  id="seatNumber"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder="e.g., 12A"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="price" className="text-xs">Price (₫)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1000000"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="class" className="text-xs">Class</Label>
              <Select value={seatClass} onValueChange={(v) => setSeatClass(v as "economy" | "business")}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="available" className="text-xs">Available</Label>
              <Switch
                id="available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isLoading} className="flex-1">
                {editMode === "create" ? "Create" : "Update"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="font-medium text-sm text-gray-600">All Seats ({seats.length})</h4>
          {seats.map((seat) => (
            <div
              key={seat.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{seat.seat_number}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  seat.class === "business" 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-sky-100 text-sky-700"
                }`}>
                  {seat.class}
                </span>
                <span className={`text-xs ${seat.is_available ? "text-green-600" : "text-red-600"}`}>
                  {seat.is_available ? "Available" : "Locked"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-2">{new Intl.NumberFormat('vi-VN').format(parseFloat(seat.price))} ₫</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(seat)}
                  disabled={isLoading}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(seat)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
