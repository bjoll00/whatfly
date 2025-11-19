const { hierarchicalFlySuggestionService } = require('../lib/hierarchicalFlySuggestionService');

async function testHierarchicalAlgorithm() {
  console.log('🎯 Testing Hierarchical Fly Suggestion Algorithm');
  
  // Test with cold water conditions (should favor midges, not Chubby Chernobyl)
  const coldWaterConditions = {
    location: 'Provo River',
    latitude: 40.2181,
    longitude: -111.6133,
    weather_conditions: 'cloudy',
    water_clarity: 'clear',
    water_level: 'normal',
    water_flow: 'moderate',
    water_temperature: 42, // Cold water
    time_of_day: 'morning',
    time_of_year: 'spring',
    wind_speed: 'light',
    air_temperature_range: 'cold'
  };
  
  console.log('\n🧪 Test 1: Cold Water Conditions (42°F)');
  console.log('Expected: Midges, nymphs, small flies');
  console.log('Should NOT suggest: Chubby Chernobyl, large dry flies');
  
  const result1 = await hierarchicalFlySuggestionService.getSuggestions(coldWaterConditions);
  
  console.log('\nResults:');
  result1.suggestions.slice(0, 5).forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.fly.name} (${suggestion.fly.type}, size ${suggestion.fly.size}) - ${suggestion.confidence}%`);
    console.log(`   Reason: ${suggestion.reason}`);
  });
  
  // Test with warm summer conditions (should favor terrestrials, hoppers)
  const warmSummerConditions = {
    location: 'Weber River',
    latitude: 41.2181,
    longitude: -111.9133,
    weather_conditions: 'sunny',
    water_clarity: 'clear',
    water_level: 'normal',
    water_flow: 'moderate',
    water_temperature: 68, // Warm water
    time_of_day: 'afternoon',
    time_of_year: 'summer',
    wind_speed: 'moderate',
    air_temperature_range: 'warm'
  };
  
  console.log('\n🧪 Test 2: Warm Summer Conditions (68°F)');
  console.log('Expected: Terrestrials, hoppers, attractor patterns');
  console.log('Should suggest: Chubby Chernobyl, hoppers, stimulators');
  
  const result2 = await hierarchicalFlySuggestionService.getSuggestions(warmSummerConditions);
  
  console.log('\nResults:');
  result2.suggestions.slice(0, 5).forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.fly.name} (${suggestion.fly.type}, size ${suggestion.fly.size}) - ${suggestion.confidence}%`);
    console.log(`   Reason: ${suggestion.reason}`);
  });
  
  // Test with night fishing conditions (should favor mouse patterns)
  const nightConditions = {
    location: 'Green River',
    latitude: 40.5181,
    longitude: -109.9133,
    weather_conditions: 'overcast',
    water_clarity: 'clear',
    water_level: 'normal',
    water_flow: 'moderate',
    water_temperature: 55,
    time_of_day: 'night',
    time_of_year: 'summer',
    wind_speed: 'calm',
    air_temperature_range: 'moderate'
  };
  
  console.log('\n🧪 Test 3: Night Fishing Conditions');
  console.log('Expected: Mouse patterns, large dark streamers');
  console.log('Should NOT suggest: Dry flies, small nymphs');
  
  const result3 = await hierarchicalFlySuggestionService.getSuggestions(nightConditions);
  
  console.log('\nResults:');
  result3.suggestions.slice(0, 5).forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion.fly.name} (${suggestion.fly.type}, size ${suggestion.fly.size}) - ${suggestion.confidence}%`);
    console.log(`   Reason: ${suggestion.reason}`);
  });
}

testHierarchicalAlgorithm().catch(console.error);
