export const getMockJsonData = () => {
  return {
    userInfo: {
      id: 1001,
      name: 'John Smith',
      age: 28,
      isActive: true,
      joinDate: '2023-01-15T08:00:00.000Z',
      departments: ['Engineering', 'Frontend'],
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'john.smith@example.com',
        address: {
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          details: '123 Tech Street',
        },
      },
    },
    systemConfig: {
      theme: 'dark',
      language: 'en_US',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      permissions: ['read', 'write', 'admin'],
      cacheTimeout: 3600,
      apiVersion: 'v2.1.0',
    },
    analytics: {
      totalVisits: 1234567,
      registeredUsers: 89012,
      activeRate: 0.85,
      growthRate: 23.6,
      timeDistribution: [
        { period: '00:00-06:00', count: 234 },
        { period: '06:00-12:00', count: 1234 },
        { period: '12:00-18:00', count: 3456 },
        { period: '18:00-24:00', count: 2345 },
      ],
      nullExample: null,
      undefinedExample: undefined,
    },
  };
};
