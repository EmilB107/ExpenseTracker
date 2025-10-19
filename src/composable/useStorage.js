import { ref } from 'vue'

export function useStorage() {
  // Sample expense data - in a real app, this would come from localStorage or API
  const expenses = ref([
    { id: 1, date: '10/15/2025', description: 'Office supplies and equipment for team', amount: 245.50 },
    { id: 2, date: '10/14/2025', description: 'Client lunch meeting at downtown restaurant', amount: 89.00 },
    { id: 3, date: '10/13/2025', description: 'Software subscription renewal', amount: 299.99 },
    { id: 4, date: '10/12/2025', description: 'Transportation and parking fees', amount: 45.00 },
    { id: 5, date: '10/11/2025', description: 'Conference registration and materials', amount: 450.00 },
    { id: 6, date: '10/10/2025', description: 'Office rent payment for November', amount: 1200.00 },
    { id: 7, date: '10/09/2025', description: 'Marketing campaign expenses', amount: 675.25 },
    { id: 8, date: '10/08/2025', description: 'Utilities and internet service', amount: 156.80 },
  ])

  return {
    expenses
  }
}
