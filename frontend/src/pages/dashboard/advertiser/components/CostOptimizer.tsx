import React, { useState } from 'react';
import { 
  DollarSign, TrendingDown, TrendingUp, AlertCircle, 
  Clock, Package, Calendar, CheckCircle, Star,
  Lightbulb, Target, BarChart3, PieChart,
  RefreshCw, Download, Filter, ArrowUpDown
} from 'lucide-react';
import { CostOptimizerProps } from '../types';
import { formatPrice, formatDeliveryDate } from '../utils';

export const CostOptimizer: React.FC<CostOptimizerProps> = ({ 
  currentOrder,
  alternatives,
  historicalData,
  recommendations,
  onSelectAlternative,
  onRequestQuote,
  onApplyOptimization,
  onViewAnalytics
}) => {
  const [selectedTab, setSelectedTab] = useState<'compare' | 'trends' | 'recommendations' | 'bulk'>('compare');
  const [sortBy, setSortBy] = useState<'price' | 'delivery' | 'quality' | 'total_value'>('total_value');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Calculate potential savings
  const currentCost = currentOrder?.totalCost || 0;
  const bestAlternative = alternatives?.reduce((best, alt) => 
    (alt.totalCost < (best?.totalCost || Infinity)) ? alt : best
  , null);
  const potentialSavings = bestAlternative ? currentCost - bestAlternative.totalCost : 0;
  const savingsPercentage = currentCost > 0 ? (potentialSavings / currentCost) * 100 : 0;

  // Sort alternatives
  const sortedAlternatives = alternatives ? [...alternatives].sort((a, b) => {
    switch(sortBy) {
      case 'price':
        return a.totalCost - b.totalCost;
      case 'delivery':
        return (a.estimatedDeliveryDays || 0) - (b.estimatedDeliveryDays || 0);
      case 'quality':
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      case 'total_value':
        return (b.valueScore || 0) - (a.valueScore || 0);
      default:
        return 0;
    }
  }) : [];

  const renderComparisonTab = () => (
    <div className="space-y-6">
      {/* Savings Summary */}
      {potentialSavings > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingDown className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">Potential Savings Available</h4>
                <p className="text-sm text-green-700">
                  Save up to {formatPrice(potentialSavings)} ({savingsPercentage.toFixed(1)}%) on this order
                </p>
              </div>
            </div>
            <button
              onClick={() => bestAlternative && onSelectAlternative(bestAlternative.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Apply Best Option
            </button>
          </div>
        </div>
      )}

      {/* Current Order */}
      {currentOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">Current Selection</h4>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Current
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Supplier</p>
              <p className="text-blue-800">{currentOrder.supplierName}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Total Cost</p>
              <p className="text-blue-800 font-bold">{formatPrice(currentOrder.totalCost)}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Delivery</p>
              <p className="text-blue-800">{currentOrder.estimatedDeliveryDays || 'N/A'} days</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Quality Score</p>
              <p className="text-blue-800">{currentOrder.qualityScore || 'N/A'}/5</p>
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Alternative Options</h4>
        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="total_value">Best Value</option>
            <option value="price">Lowest Price</option>
            <option value="delivery">Fastest Delivery</option>
            <option value="quality">Highest Quality</option>
          </select>
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alternatives List */}
      <div className="space-y-4">
        {sortedAlternatives.map((alternative, index) => {
          const savings = currentCost - alternative.totalCost;
          const savingsPercent = currentCost > 0 ? (savings / currentCost) * 100 : 0;
          const isRecommended = alternative.isRecommended;
          const isBestPrice = alternative.totalCost === Math.min(...sortedAlternatives.map(a => a.totalCost));
          
          return (
            <div 
              key={alternative.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                isRecommended ? 'border-teal-300 bg-teal-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{alternative.supplierName}</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      {isRecommended && (
                        <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                      {isBestPrice && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Best Price
                        </span>
                      )}
                      {alternative.isPremium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(alternative.totalCost)}
                  </div>
                  {savings !== 0 && (
                    <div className={`text-sm ${savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {savings > 0 ? '-' : '+'}{formatPrice(Math.abs(savings))} 
                      ({Math.abs(savingsPercent).toFixed(1)}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Details */}
              <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Material Cost</p>
                  <p className="font-medium">{formatPrice(alternative.materialCost)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Delivery Time</p>
                  <p className="font-medium">{alternative.estimatedDeliveryDays || 'N/A'} days</p>
                </div>
                <div>
                  <p className="text-gray-600">Quality Score</p>
                  <div className="flex items-center">
                    <span className="font-medium">{alternative.qualityScore || 'N/A'}/5</span>
                    {alternative.qualityScore && (
                      <div className="ml-2 flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < alternative.qualityScore! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Value Score</p>
                  <p className="font-medium">{alternative.valueScore || 'N/A'}/10</p>
                </div>
              </div>

              {/* Pros and Cons */}
              {(alternative.pros || alternative.cons) && (
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {alternative.pros && alternative.pros.length > 0 && (
                    <div>
                      <p className="text-green-600 font-medium mb-1">Advantages</p>
                      <ul className="space-y-1">
                        {alternative.pros.map((pro, proIndex) => (
                          <li key={proIndex} className="text-green-700 flex items-start">
                            <CheckCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {alternative.cons && alternative.cons.length > 0 && (
                    <div>
                      <p className="text-red-600 font-medium mb-1">Considerations</p>
                      <ul className="space-y-1">
                        {alternative.cons.map((con, conIndex) => (
                          <li key={conIndex} className="text-red-700 flex items-start">
                            <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectAlternative(alternative.id)}
                  className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 text-sm"
                >
                  Select This Option
                </button>
                <button
                  onClick={() => onRequestQuote(alternative.supplierId)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Get Custom Quote
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Alternatives */}
      {(!alternatives || alternatives.length === 0) && (
        <div className="text-center py-8">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Alternatives Available</h3>
          <p className="text-gray-600 mb-4">
            We're checking for better options for your material order
          </p>
          <button
            onClick={() => console.log('Refresh alternatives')}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Check Again
          </button>
        </div>
      )}
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      {recommendations && recommendations.length > 0 ? (
        recommendations.map((rec) => (
          <div key={rec.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
              </div>
              {rec.potentialSavings && (
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    Save {formatPrice(rec.potentialSavings)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {rec.savingsPercentage}% reduction
                  </div>
                </div>
              )}
            </div>

            {rec.actionItems && rec.actionItems.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Action Items</h5>
                <ul className="space-y-2">
                  {rec.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-sm text-gray-700">
                      <Target className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => onApplyOptimization(rec.id)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
            >
              Apply Recommendation
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations</h3>
          <p className="text-gray-600">
            Your current order is already well optimized!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
            Cost Optimizer
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Find the best value for your material orders
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onViewAnalytics}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </button>
          <button
            onClick={() => console.log('Download cost report')}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          {[
            { id: 'compare', label: 'Compare Options', icon: ArrowUpDown },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors inline-flex items-center ${
                selectedTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'compare' && renderComparisonTab()}
      {selectedTab === 'recommendations' && renderRecommendationsTab()}
    </div>
  );
};