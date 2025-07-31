// src/pages/admin/PropertyApprovals.tsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Filter, ChevronLeft, ChevronRight,
  Eye, CheckCircle, XCircle, Clock, MapPin, DollarSign,
  Calendar, Image, AlertCircle, MessageSquare
} from 'lucide-react';
import apiClient from '@/api/apiClient';
import { Link } from 'react-router-dom';

export default function PropertyApprovals() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [page, statusFilter, searchTerm]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusFilter,
        ...(searchTerm && { search: searchTerm })
      };

      console.log('🏢 Fetching properties with params:', params);
      const response = await apiClient.getProperties(params);
      
      if (response.success) {
        setProperties(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        console.log('✅ Properties loaded:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Failed to fetch properties:', error);
      // Set mock data for development
      setProperties([
        {
          id: '1',
          title: 'Downtown Billboard Space',
          address: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          status: 'PENDING',
          isApproved: false,
          basePrice: 500,
          propertyType: 'BILLBOARD',
          createdAt: new Date().toISOString(),
          owner: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          _count: { advertising_areas: 3 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId) => {
    try {
      console.log(`✅ Approving property ${propertyId}`);
      const response = await apiClient.post(`/properties/${propertyId}/approve`, {
        notes: reviewNotes || 'Approved by admin'
      });
      
      if (response.success) {
        // Update local state
        setProperties(properties.map(prop => 
          prop.id === propertyId 
            ? { ...prop, status: 'APPROVED', isApproved: true } 
            : prop
        ));
        setReviewModal(null);
        setReviewNotes('');
        console.log('✅ Property approved successfully');
      }
    } catch (error) {
      console.error('❌ Failed to approve property:', error);
      alert('Failed to approve property');
    }
  };

  const handleReject = async (propertyId) => {
    if (!reviewNotes) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      console.log(`❌ Rejecting property ${propertyId}`);
      const response = await apiClient.post(`/properties/${propertyId}/reject`, {
        notes: reviewNotes
      });
      
      if (response.success) {
        // Update local state
        setProperties(properties.map(prop => 
          prop.id === propertyId 
            ? { ...prop, status: 'REJECTED', isApproved: false } 
            : prop
        ));
        setReviewModal(null);
        setReviewNotes('');
        console.log('✅ Property rejected successfully');
      }
    } catch (error) {
      console.error('❌ Failed to reject property:', error);
      alert('Failed to reject property');
    }
  };

  const getStatusBadge = (status, isApproved) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }

    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-700', icon: XCircle },
      DRAFT: { color: 'bg-gray-100 text-gray-700', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const ReviewModal = ({ property, onClose }) => {
    if (!property) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Review Property</h2>
            <p className="text-sm text-gray-600 mt-1">{property.title}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">
                  {property.address}, {property.city}, {property.state}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900">{property.propertyType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Base Price</label>
                <p className="text-sm text-gray-900">${property.basePrice}/day</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Advertising Areas</label>
                <p className="text-sm text-gray-900">{property._count?.advertising_areas || 0} spaces</p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700">Property Owner</label>
              <p className="text-sm text-gray-900">
                {property.owner?.firstName} {property.owner?.lastName} ({property.owner?.email})
              </p>
            </div>

            {/* Review Notes */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Review Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleReject(property.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Reject
            </button>
            <button
              onClick={() => handleApprove(property.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Approvals</h1>
              <p className="text-gray-600 mt-1">Review and approve property listings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Pending Reviews: <span className="font-semibold text-yellow-600">
                  {properties.filter(p => p.status === 'PENDING').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by property name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No properties found</p>
            </div>
          ) : (
            properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Image */}
                <div className="aspect-video bg-gray-100 relative">
                  {property.primary_image ? (
                    <img 
                      src={property.primary_image} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(property.status, property.isApproved)}
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>${property.basePrice}/day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{property._count?.advertising_areas || 0} advertising spaces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted {new Date(property.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedProperty(property)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {property.status === 'PENDING' && (
                      <button
                        onClick={() => setReviewModal(property)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModal && (
          <ReviewModal 
            property={reviewModal} 
            onClose={() => {
              setReviewModal(null);
              setReviewNotes('');
            }} 
          />
        )}
      </div>
    </div>
  );
}