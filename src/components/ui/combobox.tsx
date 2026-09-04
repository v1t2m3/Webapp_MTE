"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface ComboboxOption {
    value: string;
    label: string;
    searchValue?: string; // Text to search against (e.g. code + name + date)
    subtitle?: string; // Secondary line under label
    badge?: string; // Optional badge tag
}

interface SearchableComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
    allowClear?: boolean;
}

export function removeDiacritics(str: string): string {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

export function SearchableCombobox({
    options,
    value,
    onChange,
    placeholder = "-- Chọn --",
    searchPlaceholder = "Gõ để tìm kiếm...",
    emptyText = "Không tìm thấy kết quả",
    className,
    disabled = false,
    allowClear = true,
}: SearchableComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const selectedOption = React.useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value]
    );

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm.trim()) return options;
        const normalizedSearch = removeDiacritics(searchTerm.trim());
        const searchWords = normalizedSearch.split(/\s+/);

        return options.filter((opt) => {
            const targetText = removeDiacritics(
                `${opt.label} ${opt.searchValue || ""} ${opt.subtitle || ""}`
            );
            return searchWords.every((word) => targetText.includes(word));
        });
    }, [options, searchTerm]);

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchTerm("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between font-normal text-left h-auto min-h-[40px] px-3 py-2 bg-white hover:bg-gray-50/80 border-gray-200 transition-all",
                        !selectedOption && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex flex-col truncate pr-2 text-left w-full">
                        {selectedOption ? (
                            <span className="font-medium text-gray-900 truncate">
                                {selectedOption.label}
                            </span>
                        ) : (
                            <span className="text-gray-500">{placeholder}</span>
                        )}
                        {selectedOption?.subtitle && (
                            <span className="text-xs text-gray-500 truncate">
                                {selectedOption.subtitle}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-auto">
                        {allowClear && selectedOption && (
                            <div
                                onClick={handleClear}
                                role="button"
                                tabIndex={0}
                                className="p-1 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </div>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-2 bg-white shadow-xl rounded-xl border border-gray-100 animate-in fade-in-50 zoom-in-95" align="start">
                {/* Search Header */}
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 px-1">
                    <Search className="h-4 w-4 text-gray-400 shrink-0" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 px-1"
                        autoFocus
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                            onClick={() => setSearchTerm("")}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>

                {/* Options List */}
                <div className="max-h-[280px] overflow-y-auto pt-2 space-y-1 scrollbar-thin">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500 italic">
                            {emptyText}
                        </div>
                    ) : (
                        filteredOptions.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={cn(
                                        "flex items-start justify-between p-2.5 rounded-lg cursor-pointer transition-colors text-sm",
                                        isSelected
                                            ? "bg-blue-50/80 text-blue-900 font-medium"
                                            : "hover:bg-gray-100/70 text-gray-800"
                                    )}
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate">{opt.label}</span>
                                            {opt.badge && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded border border-blue-200 shrink-0">
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </div>
                                        {opt.subtitle && (
                                            <span className="text-xs text-gray-500 truncate" title={opt.subtitle}>
                                                {opt.subtitle}
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
