import React from 'react';
import { Input } from '../../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';

const UsersFilters = ({ onSearchChange, onStatusChange }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="w-1/3">
        <Input
          placeholder="Search users by name, email, or ID..."
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-1/6">
        <Select onValueChange={onStatusChange} defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UsersFilters;
