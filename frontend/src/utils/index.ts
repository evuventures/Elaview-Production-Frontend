// Updated createPageUrl function to handle specific page mappings
export function createPageUrl(pageName: string) {
    // Define specific mappings for pages that need different URL formats
    const pageUrlMappings: Record<string, string> = {
        'CreateCampaign': '/create-campaign',
        'CreateProperty': '/list-space',  // Based on your route redirects
        'BookingManagement': '/booking-management',
        'PropertyManagement': '/property-management',
        'EditProperty': '/edit-property',
        'CampaignDetails': '/campaign-details',
        'PaymentTest': '/payment-test',
        'DataSeeder': '/data-seeder',
        'ListSpace': '/list-space',
        'TestMap': '/test-map',
        'ApiDebugTest': '/debug-api',
        'MinimalTestMap': '/debug-map'
    };

    // Check if there's a specific mapping for this page
    if (pageUrlMappings[pageName]) {
        return pageUrlMappings[pageName];
    }

    // Default behavior: convert to lowercase with hyphens
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}