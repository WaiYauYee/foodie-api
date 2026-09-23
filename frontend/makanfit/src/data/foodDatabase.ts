import { Food } from '../types/types';

export const SEARCHABLE_FOODS: Food[] = [
  {
    id: 's11',
    name: 'Bak Kut Teh',
    group: 'Protein',
    servingSize: 458,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      foodId: 's11',
      calories: 348.1,
      protein: 30.2,
      carbs: 0,
      fat: 25.2,
      fiber: 10,
      updatedAt: Date.now(),
      calDataSource: 'estimated'
    }
  },
  {
    id: 's8',
    name: 'Nasi Lemak',
    group: 'Carbs',
    servingSize: 170,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      foodId: 's8',
      calories: 650,
      protein: 25,
      carbs: 70,
      fat: 30,
      fiber: 5,
      updatedAt: Date.now(),
      calDataSource: 'estimated'
    }
  },
  {
    id: 's9',
    name: 'Apple',
    group: 'Fruit',
    servingSize: 100,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nutrients: {
      foodId: 's9',
      calories: 120,
      protein: 0.5,
      carbs: 30,
      fat: 0.3,
      fiber: 4,
      updatedAt: Date.now(),
      calDataSource: 'standard'
    }
  },
  {
    id: 's12',
    name: 'Roti Canai',
    group: 'Carbs',
    servingSize: 90,
    servingUnit: 'g',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    aliases: ['roti canai with curry', 'plain roti canai', 'roti canai kosong'],
    nutrients: {
      foodId: 's12',
      calories: 301,
      protein: 6.2,
      carbs: 33,
      fat: 15.5,
      fiber: 1.5,
      updatedAt: Date.now(),
      calDataSource: 'estimated'
    }
  }
];
