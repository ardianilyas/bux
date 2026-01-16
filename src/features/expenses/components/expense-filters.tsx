"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ExpenseFilters } from "../types";

type Category = {
  id: string;
  name: string;
  color: string;
};

type ExpenseFiltersProps = {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  categories?: Category[];
};

export function ExpenseFiltersCard({
  filters,
  onFiltersChange,
  categories,
}: ExpenseFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Date Range</Label>
            <DatePickerWithRange
              className="w-full"
              date={{
                from: filters.startDate ? new Date(filters.startDate) : undefined,
                to: filters.endDate ? new Date(filters.endDate) : undefined,
              }}
              setDate={(range: DateRange | undefined) => {
                onFiltersChange({
                  ...filters,
                  startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
                  endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
                });
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
