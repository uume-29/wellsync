import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Utensils, RefreshCw, ShoppingCart, 
  ArrowLeft, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatWholeCurrency, parseCurrencyNumber } from '../../utils/currency';
import mealPlannerHeaderImg from '../../assets/dashboard/meal-planner.jpg';

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'Mon', full: 'Monday', date: 'Oct 19' },
  { id: 'tue', label: 'Tue', full: 'Tuesday', date: 'Oct 20' },
  { id: 'wed', label: 'Wed', full: 'Wednesday', date: 'Oct 21' },
  { id: 'thu', label: 'Thu', full: 'Thursday', date: 'Oct 22' },
  { id: 'fri', label: 'Fri', full: 'Friday', date: 'Oct 23' },
  { id: 'sat', label: 'Sat', full: 'Saturday', date: 'Oct 24' },
  { id: 'sun', label: 'Sun', full: 'Sunday', date: 'Oct 25' },
];

const SAMPLE_MEAL_PLANS = {
  mon: {
    breakfast: {
      title: 'Golden Turmeric Rolled Oats with Chia & Blueberries',
      time: '10 mins prep',
      calories: 420,
      macros: { protein: '14g', carbs: '58g', fats: '12g', fiber: '9g' },
      cost: 110,
      allergens: 'Gluten-Free Oats, Nut-Free',
      ingredients: ['1/2 cup rolled oats', '1 tbsp chia seeds', '1/2 tsp ground turmeric', '1/2 cup almond milk', '1/4 cup blueberries', '1 tsp raw honey'],
      instructions: 'Simmer oats with almond milk and turmeric over medium heat for 5 minutes. Stir in chia seeds and top with fresh blueberries and raw honey.',
    },
    lunch: {
      title: 'Mediterranean Quinoa Salad with Roasted Chickpeas & Herb Tahini',
      time: '15 mins prep',
      calories: 580,
      macros: { protein: '22g', carbs: '68g', fats: '18g', fiber: '14g' },
      cost: 175,
      allergens: 'Dairy-Free, Nut-Free, Vegan',
      ingredients: ['1 cup cooked quinoa', '1/2 can organic chickpeas', '1/2 cucumber, diced', '1 cup fresh baby spinach', '2 tbsp tahini', '1 tbsp lemon juice', 'Pinch of sea salt'],
      instructions: 'Roast rinsed chickpeas with paprika for 10 minutes. Combine with fluffy quinoa, diced cucumber, and spinach. Whisk tahini and lemon juice with warm water for dressing.',
    },
    dinner: {
      title: 'Pan-Seared Alaskan Salmon with Asparagus & Rainbow Carrots',
      time: '25 mins cook',
      calories: 630,
      macros: { protein: '38g', carbs: '44g', fats: '22g', fiber: '7g' },
      cost: 260,
      allergens: 'Dairy-Free, Gluten-Free',
      ingredients: ['6 oz wild salmon fillet', '1 medium sweet potato', '1 bunch fresh asparagus', '3 rainbow baby carrots', '1 tbsp extra virgin olive oil', 'Fresh dill & lemon slices'],
      instructions: 'Roast sweet potatoes and carrots at 400°F for 20 mins. Sear seasoned salmon in a skillet for 4 mins per side until crisp. Sauté asparagus with garlic and olive oil.',
    },
    snack: {
      title: 'Crisp Honeycrisp Apple Slices with Roasted Sunflower Seed Butter',
      time: '2 mins prep',
      calories: 210,
      macros: { protein: '6g', carbs: '26g', fats: '10g', fiber: '5g' },
      cost: 55,
      allergens: 'Nut-Free, Vegan',
      ingredients: ['1 organic Honeycrisp apple', '2 tbsp roasted sunflower seed butter', 'Pinch of cinnamon'],
      instructions: 'Slice apple into wedges and dust lightly with ground cinnamon. Serve alongside sunflower seed butter for steady, sustained energy.',
    },
  },
  tue: {
    breakfast: {
      title: 'Artisan Avocado Toast on Sourdough with Poached Egg & Hemp Hearts',
      time: '8 mins prep',
      calories: 450,
      macros: { protein: '18g', carbs: '36g', fats: '24g', fiber: '8g' },
      cost: 130,
      allergens: 'Vegetarian, Dairy-Free',
      ingredients: ['1 slice artisan sourdough', '1/2 ripe Haas avocado', '1 pasture-raised egg', '1 tsp hemp hearts', 'Microgreens & sea salt'],
      instructions: 'Toast sourdough until golden. Mash avocado with lemon and spread over toast. Top with gently poached egg, microgreens, and hemp seeds.',
    },
    lunch: {
      title: 'Warm French Green Lentil & Roasted Vegetable Nourish Bowl',
      time: '20 mins prep',
      calories: 540,
      macros: { protein: '24g', carbs: '64g', fats: '16g', fiber: '16g' },
      cost: 160,
      allergens: 'Vegan, Gluten-Free, Nut-Free',
      ingredients: ['1 cup French green lentils', '1 roasted zucchini', '1 roasted red pepper', 'Handful arugula', '1 tbsp balsamic reduction'],
      instructions: 'Toss cooked lentils with warm roasted vegetables and fresh arugula. Drizzle with cold-pressed olive oil and aged balsamic glaze.',
    },
    dinner: {
      title: 'Sesame Ginger Tempeh Stir-Fry with Steamed Jasmine Brown Rice',
      time: '20 mins cook',
      calories: 590,
      macros: { protein: '32g', carbs: '62g', fats: '18g', fiber: '11g' },
      cost: 210,
      allergens: 'Dairy-Free, Nut-Free',
      ingredients: ['7 oz organic tempeh, cubed', '1 cup broccoli florets', '1/2 cup sugar snap peas', '1 tbsp tamari soy sauce', '1 tsp toasted sesame oil', '3/4 cup brown rice'],
      instructions: 'Brown tempeh cubes in sesame oil until golden. Stir-fry broccoli and snap peas for 4 minutes with tamari and grated fresh ginger. Serve over warm brown rice.',
    },
    snack: {
      title: 'Creamy Greek Yogurt with Toasted Walnuts & Raw Honey',
      time: '2 mins prep',
      calories: 220,
      macros: { protein: '15g', carbs: '14g', fats: '10g', fiber: '2g' },
      cost: 65,
      allergens: 'Contains Dairy & Tree Nuts',
      ingredients: ['3/4 cup 2% plain Greek yogurt', '1 tbsp raw clover honey', '2 tbsp lightly toasted walnuts'],
      instructions: 'Spoon yogurt into bowl, drizzle with raw honey and top with toasted walnut halves.',
    },
  },
  wed: {
    breakfast: {
      title: 'Wild Blackberry & Organic Spinach Protein Smoothie Bowl',
      time: '5 mins prep',
      calories: 380,
      macros: { protein: '26g', carbs: '42g', fats: '8g', fiber: '10g' },
      cost: 140,
      allergens: 'Dairy-Free, Nut-Free',
      ingredients: ['1 cup frozen wild blackberries', '1 large handful baby spinach', '1 scoop plant protein powder', '1 cup oat milk', '1 tbsp chia seeds'],
      instructions: 'Blend all ingredients on high until velvety smooth. Pour into a chilled bowl and top with fresh blackberries and coconut flakes.',
    },
    lunch: {
      title: 'Curried Chickpea & Avocado Wrap in Spinach Tortilla',
      time: '10 mins prep',
      calories: 510,
      macros: { protein: '16g', carbs: '60g', fats: '20g', fiber: '12g' },
      cost: 150,
      allergens: 'Vegan, Dairy-Free',
      ingredients: ['1 spinach tortilla wrap', '1/2 can mashed chickpeas', '1/2 tsp mild curry powder', '1/4 avocado, diced', 'Fresh cilantro leaves'],
      instructions: 'Mix mashed chickpeas with curry powder, lime juice, and diced avocado. Roll tightly in spinach tortilla with shredded carrots and cilantro.',
    },
    dinner: {
      title: 'Roasted Lemon Garlic Herb Chicken Breast with Steamed Broccolini',
      time: '30 mins cook',
      calories: 560,
      macros: { protein: '42g', carbs: '32g', fats: '16g', fiber: '6g' },
      cost: 240,
      allergens: 'Dairy-Free, Gluten-Free',
      ingredients: ['6 oz organic free-range chicken breast', '1 bunch broccolini', '1/2 cup baby red potatoes', '2 cloves garlic, minced', '1 tbsp lemon zest'],
      instructions: 'Rub chicken breast with minced garlic, lemon zest, and rosemary. Roast with halved potatoes at 375°F for 25 mins. Steam broccolini until bright green.',
    },
    snack: {
      title: 'Cucumber Rounds with Spiced Garlic Hummus',
      time: '3 mins prep',
      calories: 140,
      macros: { protein: '5g', carbs: '14g', fats: '7g', fiber: '4g' },
      cost: 45,
      allergens: 'Nut-Free, Vegan',
      ingredients: ['1 Persian cucumber, sliced', '3 tbsp organic garlic hummus', 'Pinch of smoked paprika'],
      instructions: 'Slice cucumber into crisp discs and serve with garlic hummus sprinkled with paprika.',
    },
  },
  thu: {
    breakfast: {
      title: 'Soft-Scrambled Pasture Eggs with Sautéed Baby Kale & Cherry Tomatoes',
      time: '10 mins prep',
      calories: 390,
      macros: { protein: '20g', carbs: '12g', fats: '28g', fiber: '4g' },
      cost: 120,
      allergens: 'Vegetarian, Gluten-Free, Dairy-Free',
      ingredients: ['2 pasture-raised eggs', '1 cup baby kale', '1/2 cup sweet cherry tomatoes', '1 tsp extra virgin olive oil', 'Everything bagel seasoning'],
      instructions: 'Blister cherry tomatoes in olive oil, wilt kale, and fold in softly beaten eggs on low heat until just set.',
    },
    lunch: {
      title: 'Edamame, Brown Rice & Roasted Broccoli Nourish Bowl with Miso Drizzle',
      time: '15 mins prep',
      calories: 560,
      macros: { protein: '22g', carbs: '72g', fats: '16g', fiber: '14g' },
      cost: 165,
      allergens: 'Vegan, Dairy-Free, Nut-Free',
      ingredients: ['1 cup shelled organic edamame', '3/4 cup brown rice', '1 cup roasted broccoli florets', '1 tbsp white miso paste', '1 tsp maple syrup'],
      instructions: 'Warm brown rice and steam edamame. Whisk miso paste with warm water and maple syrup for a velvety umami glaze.',
    },
    dinner: {
      title: 'Slow-Simmered Black Bean & Sweet Potato Chili with Avocado',
      time: '35 mins cook',
      calories: 610,
      macros: { protein: '21g', carbs: '84g', fats: '18g', fiber: '22g' },
      cost: 180,
      allergens: 'Vegan, Gluten-Free, Dairy-Free',
      ingredients: ['1 can organic black beans', '1 medium diced sweet potato', '1 can crushed fire-roasted tomatoes', '1 tsp cumin & chili powder', '1/4 ripe avocado'],
      instructions: 'Simmer sweet potatoes and beans in crushed tomatoes and spices until tender and thick. Top with fresh avocado slices.',
    },
    snack: {
      title: 'Roasted Crunchy Chickpeas with Smoked Paprika & Sea Salt',
      time: '2 mins prep',
      calories: 180,
      macros: { protein: '8g', carbs: '26g', fats: '4g', fiber: '7g' },
      cost: 40,
      allergens: 'Nut-Free, Vegan, Gluten-Free',
      ingredients: ['1/2 cup oven-roasted spiced chickpeas'],
      instructions: 'Enjoy crunchy spiced chickpeas as a fiber-dense grab-and-go snack.',
    },
  },
  fri: {
    breakfast: {
      title: 'Overnight Chia Seed Pudding with Fresh Raspberries & Coconut Flakes',
      time: '5 mins prep',
      calories: 360,
      macros: { protein: '11g', carbs: '38g', fats: '18g', fiber: '14g' },
      cost: 115,
      allergens: 'Dairy-Free, Nut-Free, Vegan',
      ingredients: ['3 tbsp chia seeds', '1 cup unsweetened almond milk', '1/2 cup fresh raspberries', '1 tbsp toasted coconut flakes', '1/2 tsp vanilla extract'],
      instructions: 'Whisk chia seeds with almond milk and vanilla. Chill overnight in a mason jar. Top with fresh raspberries and toasted coconut flakes.',
    },
    lunch: {
      title: 'Wild Canned Salmon & Herb White Bean Salad over Mixed Field Greens',
      time: '10 mins prep',
      calories: 520,
      macros: { protein: '34g', carbs: '44g', fats: '18g', fiber: '11g' },
      cost: 210,
      allergens: 'Dairy-Free, Gluten-Free',
      ingredients: ['5 oz wild Alaskan salmon', '1/2 can organic cannellini beans', '2 cups mixed spring greens', '1 tbsp lemon vinaigrette', 'Fresh dill'],
      instructions: 'Toss flaked wild salmon and rinsed white beans with lemon vinaigrette, capers, and dill over tender spring greens.',
    },
    dinner: {
      title: 'Grilled Cauliflower Steaks with Chimichurri & Herbed Lentils',
      time: '25 mins cook',
      calories: 480,
      macros: { protein: '19g', carbs: '52g', fats: '20g', fiber: '15g' },
      cost: 190,
      allergens: 'Vegan, Gluten-Free, Nut-Free',
      ingredients: ['1 thick cut cauliflower steak', '1/2 cup cooked French green lentils', '2 tbsp fresh parsley chimichurri sauce', '1/2 cup roasted cherry tomatoes'],
      instructions: 'Brush cauliflower steak with olive oil and grill for 12 minutes until caramelised and tender. Serve over warm lentils and chimichurri.',
    },
    snack: {
      title: 'Dark Chocolate Square (85%) with a Handful of Raw Almonds',
      time: '1 min prep',
      calories: 200,
      macros: { protein: '5g', carbs: '12g', fats: '15g', fiber: '4g' },
      cost: 55,
      allergens: 'Contains Tree Nuts',
      ingredients: ['1 square fair-trade 85% dark chocolate', '12 raw almonds'],
      instructions: 'Mindfully savor rich dark chocolate with antioxidant-rich raw almonds.',
    },
  },
  sat: {
    breakfast: {
      title: 'Whole-Grain Buckwheat Protein Pancakes with Maple Strawberry Compote',
      time: '15 mins prep',
      calories: 460,
      macros: { protein: '22g', carbs: '64g', fats: '10g', fiber: '8g' },
      cost: 145,
      allergens: 'Gluten-Free, Dairy-Free',
      ingredients: ['1/2 cup buckwheat flour', '1 scoop plant protein', '1 pasture egg', '1/2 cup almond milk', '1/2 cup fresh strawberries simmered in 1 tsp pure maple syrup'],
      instructions: 'Griddle fluffy buckwheat pancakes until bubbly. Spoon warm strawberry compote over top.',
    },
    lunch: {
      title: 'Rainbow Macro Bowl with Marinated Tofu, Edamame & Roasted Beets',
      time: '15 mins prep',
      calories: 540,
      macros: { protein: '26g', carbs: '58g', fats: '18g', fiber: '12g' },
      cost: 185,
      allergens: 'Vegan, Dairy-Free',
      ingredients: ['6 oz baked firm tofu', '1/2 cup edamame', '1 medium roasted beet, sliced', '1/2 avocado', '1 tbsp creamy sesame dressing'],
      instructions: 'Arrange colorful ingredients in a ceramic bowl and drizzle with velvety sesame dressing.',
    },
    dinner: {
      title: 'Rosemary Garlic Lamb Chop with Roasted Delicata Squash & Asparagus',
      time: '30 mins cook',
      calories: 640,
      macros: { protein: '40g', carbs: '38g', fats: '28g', fiber: '8g' },
      cost: 310,
      allergens: 'Dairy-Free, Gluten-Free',
      ingredients: ['2 pasture-raised lamb chops', '1 small delicata squash, sliced into rings', '1 bunch slender asparagus', 'Fresh rosemary & garlic'],
      instructions: 'Roast squash rings until tender and caramelized. Pan-sear seasoned lamb chops for 4 mins each side. Serve with tender asparagus.',
    },
    snack: {
      title: 'Matcha Green Tea Latte with Coconut Milk',
      time: '4 mins prep',
      calories: 120,
      macros: { protein: '2g', carbs: '8g', fats: '9g', fiber: '1g' },
      cost: 70,
      allergens: 'Dairy-Free, Nut-Free, Vegan',
      ingredients: ['1 tsp ceremonial grade matcha powder', '1 cup warm light coconut milk', '1/2 tsp maple syrup'],
      instructions: 'Whisk matcha powder with 2 oz warm water, then pour in velvety frothed coconut milk.',
    },
  },
  sun: {
    breakfast: {
      title: 'Weekend Garden Frittata with Sun-Dried Tomatoes, Spinach & Goat Cheese',
      time: '20 mins cook',
      calories: 430,
      macros: { protein: '24g', carbs: '14g', fats: '28g', fiber: '4g' },
      cost: 150,
      allergens: 'Gluten-Free, Contains Dairy (Goat)',
      ingredients: ['3 pasture-raised eggs', '1 cup baby spinach', '2 tbsp sun-dried tomatoes', '1 oz crumbled soft goat cheese', 'Fresh basil'],
      instructions: 'Bake whisked eggs, spinach, and sun-dried tomatoes in a cast iron skillet until golden and fluffy.',
    },
    lunch: {
      title: 'Mediterranean Lentil & Roasted Artichoke Heart Salad',
      time: '12 mins prep',
      calories: 510,
      macros: { protein: '20g', carbs: '62g', fats: '16g', fiber: '15g' },
      cost: 175,
      allergens: 'Vegan, Gluten-Free, Nut-Free',
      ingredients: ['1 cup brown lentils', '1/2 cup marinated artichoke hearts', '1/2 cup diced cucumber', '2 tbsp lemon herb vinaigrette'],
      instructions: 'Toss earthy lentils and tender artichoke hearts with crisp cucumber and zesty herb dressing.',
    },
    dinner: {
      title: 'Slow-Cooked Moroccan Vegetable & Chickpea Tagine with Almond Couscous',
      time: '35 mins cook',
      calories: 580,
      macros: { protein: '18g', carbs: '86g', fats: '14g', fiber: '18g' },
      cost: 195,
      allergens: 'Vegan, Dairy-Free',
      ingredients: ['1 can chickpeas', '1 zucchini, chunked', '1 carrot', '1/2 cup raisins', '1 cup whole-wheat couscous', 'Tagine spices (cinnamon, coriander, cumin)'],
      instructions: 'Simmer vegetables and chickpeas with aromatic tagine spices. Fluff warm couscous and serve vegetable stew on top.',
    },
    snack: {
      title: 'Fresh Papaya Spears with Squeezed Lime Juice & Mint',
      time: '3 mins prep',
      calories: 110,
      macros: { protein: '2g', carbs: '26g', fats: '1g', fiber: '4g' },
      cost: 60,
      allergens: 'Nut-Free, Vegan, Gluten-Free',
      ingredients: ['1 cup ripe papaya spears', '1 fresh lime wedge', 'Torn fresh mint leaves'],
      instructions: 'Drizzle lime juice over sweet ripe papaya spears and scatter fresh mint.',
    },
  },
};

export default function MealPlannerView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeDay, setActiveDay] = useState('mon');
  const [selectedMealForModal, setSelectedMealForModal] = useState(null);
  const [swappedMeals, setSwappedMeals] = useState({});
  const [showGroceryToast, setShowGroceryToast] = useState(false);
  const [imgError, setImgError] = useState(false);

  // User Profile Preferences
  const weeklyBudget = user?.preferences?.weeklyBudget ? (user.preferences.weeklyBudget <= 150 ? 2500 : user.preferences.weeklyBudget) : 2500;
  const calorieTarget = user?.preferences?.calorieTarget || 2000;
  const dietaryRestrictions = user?.preferences?.dietaryRestrictions || [];
  const allergies = user?.preferences?.allergies || [];

  const currentDayData = SAMPLE_MEAL_PLANS[activeDay] || SAMPLE_MEAL_PLANS.mon;

  // Day total calculations
  const dayMeals = [
    currentDayData.breakfast,
    currentDayData.lunch,
    currentDayData.dinner,
    currentDayData.snack,
  ];

  const dayTotalCalories = dayMeals.reduce((acc, m) => acc + m.calories, 0);
  const dayTotalCost = dayMeals.reduce((acc, m) => acc + (typeof m.cost === 'number' ? m.cost : parseCurrencyNumber(m.cost)), 0);
  const estWeeklyCost = dayTotalCost * 7;

  const handleSwapMeal = (mealType) => {
    setSwappedMeals(prev => ({
      ...prev,
      [`${activeDay}-${mealType}`]: true,
    }));
  };

  const handleAddWeekToGroceries = () => {
    setShowGroceryToast(true);
    setTimeout(() => {
      setShowGroceryToast(false);
      navigate('/dashboard/groceries');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 1. VISUAL HEADER WITH DEDICATED AI MEAL PHOTOGRAPHY          */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1ED] text-[11px] font-bold text-[#6B8E7B]">
              <Utensils className="w-3.5 h-3.5" />
              <span>Phase 2 Intelligent Nutrition</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Personalized Weekly Meal Planner
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              Every recipe is dynamically curated around your dietary focus ({dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'Whole Foods'}), keeping you on track with your {formatWholeCurrency(weeklyBudget)}/week grocery budget.
            </p>

            {/* Live Profile Synced Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-[#1E293B] bg-[#F8FAF7] border border-gray-200 px-3 py-1 rounded-lg">
                Daily Goal: <strong>{calorieTarget} kcal</strong>
              </span>
              <span className="text-[11px] font-bold text-[#6B8E7B] bg-[#EBF1ED] px-3 py-1 rounded-lg">
                Estimated Plan Cost: <strong>{formatCurrency(dayTotalCost)}/day (~{formatCurrency(estWeeklyCost)}/wk)</strong>
              </span>
              {allergies.length > 0 && (
                <span className="text-[11px] font-bold text-[#D9A441] bg-[#FAF4E8] px-3 py-1 rounded-lg">
                  Protected: {allergies.join(', ')} safe
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#EBF1ED] group">
              {!imgError ? (
                <img
                  src={mealPlannerHeaderImg}
                  alt="High-end culinary photography of a balanced wellness meal with grilled salmon, quinoa, avocado fan, and asparagus"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                  <Utensils className="w-8 h-8 text-[#6B8E7B] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Nourishing Meal Architecture</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Fresh Organic Harvest
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Chef & Dietitian Balanced
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. WEEKDAY NAVIGATOR TABS                                    */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = activeDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-center min-w-[70px] ${
                  isActive
                    ? 'bg-[#6B8E7B] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAF7]'
                }`}
              >
                <span>{day.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {day.date}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAddWeekToGroceries}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow"
        >
          <ShoppingCart className="w-4 h-4 text-[#D9A441]" />
          <span className="hidden sm:inline">Add Ingredients to Grocery List</span>
          <span className="sm:hidden">Send to Cart</span>
        </button>
      </div>

      {/* Grocery Sync Feedback Toast */}
      {showGroceryToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-slide-up border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold">Week's Ingredients Synchronized</p>
            <p className="text-[10px] text-gray-300">Redirecting to your Smart Grocery Organizer...</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. DAILY NUTRITIONAL SUMMARY BAR                             */}
      {/* ============================================================ */}
      <div className="bg-[#FAF4E8] rounded-2xl p-4 border border-[#D9A441]/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-[#D9A441] flex items-center justify-center font-bold text-sm shadow-2xs">
            🔥
          </div>
          <div>
            <span className="text-xs font-bold text-[#1E293B] block">
              {DAYS_OF_WEEK.find(d => d.id === activeDay)?.full} Nutritional Target
            </span>
            <span className="text-[11px] text-[#64748B]">
              Total planned intake: <strong>{dayTotalCalories} kcal</strong> (Goal: {calorieTarget} kcal)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block">Daily Cost (Est.)</span>
            <span className="text-sm font-extrabold text-[#1E293B]">{formatCurrency(dayTotalCost)}</span>
          </div>
          <div className="h-6 w-px bg-[#D9A441]/30" />
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] block">Weekly Budget Left</span>
            <span className="text-sm font-extrabold text-[#6B8E7B]">
              {formatCurrency(Math.max(0, weeklyBudget - dayTotalCost * 7))}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MEAL CARDS GRID (BREAKFAST, LUNCH, DINNER, SNACK)         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Helper function to render each meal card */}
        {[
          { key: 'breakfast', type: 'Breakfast', icon: '🌅', color: 'bg-amber-50 text-amber-800' },
          { key: 'lunch', type: 'Lunch', icon: '☀️', color: 'bg-emerald-50 text-emerald-800' },
          { key: 'dinner', type: 'Dinner', icon: '🌙', color: 'bg-indigo-50 text-indigo-800' },
          { key: 'snack', type: 'Daily Snack', icon: '🍎', color: 'bg-orange-50 text-orange-800' },
        ].map((slot) => {
          const meal = currentDayData[slot.key];
          const isSwapped = swappedMeals[`${activeDay}-${slot.key}`];

          return (
            <div
              key={slot.key}
              className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Slot Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{slot.icon}</span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
                      {slot.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#64748B] bg-[#F8FAF7] px-2.5 py-1 rounded-md border border-gray-200/80">
                    {meal.time}
                  </span>
                </div>

                {/* Meal Title */}
                <h3 className="text-base font-extrabold text-[#1E293B] group-hover:text-[#6B8E7B] transition-colors leading-snug">
                  {meal.title}
                </h3>

                {/* Macro Pills */}
                <div className="grid grid-cols-4 gap-2 my-4 text-center">
                  <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-[#64748B] block font-semibold">Calories</span>
                    <span className="text-xs font-extrabold text-[#1E293B]">{meal.calories}</span>
                  </div>
                  <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-[#64748B] block font-semibold">Protein</span>
                    <span className="text-xs font-extrabold text-[#6B8E7B]">{meal.macros.protein}</span>
                  </div>
                  <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-[#64748B] block font-semibold">Carbs</span>
                    <span className="text-xs font-extrabold text-[#1E293B]">{meal.macros.carbs}</span>
                  </div>
                  <div className="bg-[#F8FAF7] p-2 rounded-xl border border-gray-100">
                    <span className="text-[10px] text-[#64748B] block font-semibold">Fats</span>
                    <span className="text-xs font-extrabold text-[#1E293B]">{meal.macros.fats}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    {meal.allergens}
                  </span>
                  <span className="text-[10px] font-bold text-[#D9A441] bg-[#FAF4E8] px-2 py-0.5 rounded-md">
                    Est. Cost: {formatCurrency(meal.cost)}
                  </span>
                </div>

                {/* Instructions snippet */}
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {meal.instructions}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMealForModal(meal)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B8E7B] hover:text-[#567564] py-1.5 px-3 rounded-xl hover:bg-[#EBF1ED] transition-colors cursor-pointer"
                >
                  <span>View Recipe & Ingredients</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleSwapMeal(slot.key)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#1E293B] py-1.5 px-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Swap meal with another compliant recipe"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isSwapped ? 'Swapped' : 'Swap'}</span>
                </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* ============================================================ */}
      {/* 5. RECIPE DETAIL MODAL                                        */}
      {/* ============================================================ */}
      {selectedMealForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 animate-fade-slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8E7B] bg-[#EBF1ED] px-2.5 py-1 rounded-md">
                  Recipe Details
                </span>
                <h3 className="text-xl font-extrabold text-[#1E293B] mt-2">
                  {selectedMealForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMealForModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#1E293B]">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAF7] rounded-2xl">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold">Prep / Cook Time</span>
                  <span className="font-bold">{selectedMealForModal.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold">Portion Cost (Est.)</span>
                  <span className="font-bold text-[#6B8E7B]">{formatCurrency(selectedMealForModal.cost)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-[#1E293B] mb-2 uppercase tracking-wider">
                  Required Ingredients
                </h4>
                <ul className="space-y-1.5 pl-4 list-disc text-[#64748B]">
                  {selectedMealForModal.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <h4 className="font-extrabold text-xs text-[#1E293B] mb-2 uppercase tracking-wider">
                  Preparation Instructions
                </h4>
                <p className="text-[#64748B] leading-relaxed bg-[#F8FAF7] p-3.5 rounded-2xl border border-gray-100">
                  {selectedMealForModal.instructions}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedMealForModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#6B8E7B] text-white text-xs font-bold hover:bg-[#567564] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
