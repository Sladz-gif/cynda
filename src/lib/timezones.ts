/**
 * Comprehensive list of timezone options for the application
 * Includes all major timezones organized by region
 */

export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
}

export const TIMEZONES: TimezoneOption[] = [
  // UTC
  { value: "UTC", label: "UTC (Coordinated Universal Time)", region: "UTC" },
  
  // Americas
  { value: "America/New_York", label: "Eastern Time (New York)", region: "Americas" },
  { value: "America/Chicago", label: "Central Time (Chicago)", region: "Americas" },
  { value: "America/Denver", label: "Mountain Time (Denver)", region: "Americas" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)", region: "Americas" },
  { value: "America/Anchorage", label: "Alaska Time (Anchorage)", region: "Americas" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (Honolulu)", region: "Americas" },
  { value: "America/Toronto", label: "Eastern Time (Toronto)", region: "Americas" },
  { value: "America/Vancouver", label: "Pacific Time (Vancouver)", region: "Americas" },
  { value: "America/Mexico_City", label: "Central Time (Mexico City)", region: "Americas" },
  { value: "America/Sao_Paulo", label: "Brasilia Time (São Paulo)", region: "Americas" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina Time (Buenos Aires)", region: "Americas" },
  { value: "America/Lima", label: "Peru Time (Lima)", region: "Americas" },
  { value: "America/Bogota", label: "Colombia Time (Bogota)", region: "Americas" },
  { value: "America/Caracas", label: "Venezuela Time (Caracas)", region: "Americas" },
  
  // Europe
  { value: "Europe/London", label: "Greenwich Mean Time (London)", region: "Europe" },
  { value: "Europe/Paris", label: "Central European Time (Paris)", region: "Europe" },
  { value: "Europe/Berlin", label: "Central European Time (Berlin)", region: "Europe" },
  { value: "Europe/Rome", label: "Central European Time (Rome)", region: "Europe" },
  { value: "Europe/Madrid", label: "Central European Time (Madrid)", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Central European Time (Amsterdam)", region: "Europe" },
  { value: "Europe/Brussels", label: "Central European Time (Brussels)", region: "Europe" },
  { value: "Europe/Zurich", label: "Central European Time (Zurich)", region: "Europe" },
  { value: "Europe/Vienna", label: "Central European Time (Vienna)", region: "Europe" },
  { value: "Europe/Stockholm", label: "Central European Time (Stockholm)", region: "Europe" },
  { value: "Europe/Copenhagen", label: "Central European Time (Copenhagen)", region: "Europe" },
  { value: "Europe/Helsinki", label: "Eastern European Time (Helsinki)", region: "Europe" },
  { value: "Europe/Warsaw", label: "Central European Time (Warsaw)", region: "Europe" },
  { value: "Europe/Prague", label: "Central European Time (Prague)", region: "Europe" },
  { value: "Europe/Athens", label: "Eastern European Time (Athens)", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow Time (Moscow)", region: "Europe" },
  { value: "Europe/Istanbul", label: "Turkey Time (Istanbul)", region: "Europe" },
  { value: "Europe/Dublin", label: "Irish Time (Dublin)", region: "Europe" },
  { value: "Europe/Lisbon", label: "Western European Time (Lisbon)", region: "Europe" },
  
  // Asia
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)", region: "Asia" },
  { value: "Asia/Shanghai", label: "China Standard Time (Shanghai)", region: "Asia" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time (Hong Kong)", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore Time (Singapore)", region: "Asia" },
  { value: "Asia/Seoul", label: "Korea Standard Time (Seoul)", region: "Asia" },
  { value: "Asia/Bangkok", label: "Indochina Time (Bangkok)", region: "Asia" },
  { value: "Asia/Jakarta", label: "Western Indonesia Time (Jakarta)", region: "Asia" },
  { value: "Asia/Kolkata", label: "India Standard Time (Kolkata)", region: "Asia" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai)", region: "Asia" },
  { value: "Asia/Riyadh", label: "Arabian Standard Time (Riyadh)", region: "Asia" },
  { value: "Asia/Tehran", label: "Iran Standard Time (Tehran)", region: "Asia" },
  { value: "Asia/Karachi", label: "Pakistan Time (Karachi)", region: "Asia" },
  { value: "Asia/Dhaka", label: "Bangladesh Time (Dhaka)", region: "Asia" },
  { value: "Asia/Colombo", label: "Sri Lanka Time (Colombo)", region: "Asia" },
  { value: "Asia/Kuala_Lumpur", label: "Malaysia Time (Kuala Lumpur)", region: "Asia" },
  { value: "Asia/Manila", label: "Philippines Time (Manila)", region: "Asia" },
  { value: "Asia/Taipei", label: "Taiwan Time (Taipei)", region: "Asia" },
  { value: "Asia/Ho_Chi_Minh", label: "Indochina Time (Ho Chi Minh)", region: "Asia" },
  
  // Oceania
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney)", region: "Oceania" },
  { value: "Australia/Melbourne", label: "Australian Eastern Time (Melbourne)", region: "Oceania" },
  { value: "Australia/Brisbane", label: "Australian Eastern Time (Brisbane)", region: "Oceania" },
  { value: "Australia/Perth", label: "Australian Western Time (Perth)", region: "Oceania" },
  { value: "Australia/Adelaide", label: "Australian Central Time (Adelaide)", region: "Oceania" },
  { value: "Pacific/Auckland", label: "New Zealand Time (Auckland)", region: "Oceania" },
  { value: "Pacific/Fiji", label: "Fiji Time (Fiji)", region: "Oceania" },
  { value: "Pacific/Guam", label: "Chamorro Time (Guam)", region: "Oceania" },
  
  // Africa
  { value: "Africa/Cairo", label: "Eastern European Time (Cairo)", region: "Africa" },
  { value: "Africa/Johannesburg", label: "South Africa Standard Time (Johannesburg)", region: "Africa" },
  { value: "Africa/Lagos", label: "West Africa Time (Lagos)", region: "Africa" },
  { value: "Africa/Nairobi", label: "East Africa Time (Nairobi)", region: "Africa" },
  { value: "Africa/Casablanca", label: "Western European Time (Casablanca)", region: "Africa" },
  { value: "Africa/Tunis", label: "Central European Time (Tunis)", region: "Africa" },
  { value: "Africa/Algiers", label: "Central European Time (Algiers)", region: "Africa" },
  
  // Middle East
  { value: "Asia/Jerusalem", label: "Israel Standard Time (Jerusalem)", region: "Middle East" },
  { value: "Asia/Beirut", label: "Eastern European Time (Beirut)", region: "Middle East" },
  { value: "Asia/Amman", label: "Eastern European Time (Amman)", region: "Middle East" },
  { value: "Asia/Baghdad", label: "Arabian Standard Time (Baghdad)", region: "Middle East" },
  { value: "Asia/Kuwait", label: "Arabian Standard Time (Kuwait)", region: "Middle East" },
  { value: "Asia/Bahrain", label: "Arabian Standard Time (Bahrain)", region: "Middle East" },
  { value: "Asia/Qatar", label: "Arabian Standard Time (Qatar)", region: "Middle East" },
  { value: "Asia/Muscat", label: "Gulf Standard Time (Muscat)", region: "Middle East" },
];

export const TIMEZONES_BY_REGION = TIMEZONES.reduce((acc, tz) => {
  if (!acc[tz.region]) {
    acc[tz.region] = [];
  }
  acc[tz.region].push(tz);
  return acc;
}, {} as Record<string, TimezoneOption[]>);

export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function getTimezoneLabel(value: string): string {
  const timezone = TIMEZONES.find(tz => tz.value === value);
  return timezone?.label || value;
}

export function getTimezoneByRegion(region: string): TimezoneOption[] {
  return TIMEZONES_BY_REGION[region] || [];
}
