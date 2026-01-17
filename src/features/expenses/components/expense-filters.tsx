"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
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
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.search ||
    (filters.categoryId && filters.categoryId !== "all") ||
    filters.startDate ||
    filters.endDate;

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      categoryId: "all",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Mobile: Search + Toggle */}
        <div className="flex gap-2 md:hidden">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile: Collapsible Filters */}
        {showFilters && (
          <div className="mt-4 space-y-4 md:hidden">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Category</Label>
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
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Date Range</Label>
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
        )}

        {/* Desktop: Full Filters */}
        <div className="hidden md:grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
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
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePickerWithRange
            className="col-span-2"
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
      </CardContent>
    </Card>
  );
}
