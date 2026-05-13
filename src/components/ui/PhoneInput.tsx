import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength?: number;
}

const countries: Country[] = [
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", maxLength: 9 },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", maxLength: 10 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", maxLength: 10 },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", maxLength: 10 },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", maxLength: 9 },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", maxLength: 9 },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", maxLength: 9 },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", maxLength: 10 },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", maxLength: 10 },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", maxLength: 9 },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", maxLength: 10 },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", maxLength: 9 },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", maxLength: 10 },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳", maxLength: 11 },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", maxLength: 10 },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", maxLength: 11 },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", maxLength: 10 },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", maxLength: 10 },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", maxLength: 9 },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪", maxLength: 9 },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", maxLength: 10 },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪", maxLength: 10 },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨", maxLength: 9 },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾", maxLength: 8 },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾", maxLength: 9 },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴", maxLength: 8 },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺", maxLength: 8 },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", maxLength: 8 },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦", maxLength: 8 },
  { code: "DO", name: "Dominican Republic", dialCode: "+1", flag: "🇩🇴", maxLength: 10 },
  { code: "HT", name: "Haiti", dialCode: "+509", flag: "🇭🇹", maxLength: 8 },
  { code: "JM", name: "Jamaica", dialCode: "+1", flag: "🇯🇲", maxLength: 7 },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1", flag: "🇹🇹", maxLength: 7 },
  { code: "BB", name: "Barbados", dialCode: "+1", flag: "🇧🇧", maxLength: 7 },
  { code: "BS", name: "Bahamas", dialCode: "+1", flag: "🇧🇸", maxLength: 7 },
  { code: "GD", name: "Grenada", dialCode: "+1", flag: "🇬🇩", maxLength: 7 },
  { code: "LC", name: "St. Lucia", dialCode: "+1", flag: "🇱🇨", maxLength: 7 },
  { code: "VC", name: "St. Vincent and the Grenadines", dialCode: "+1", flag: "🇻🇨", maxLength: 7 },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1", flag: "🇦🇬", maxLength: 7 },
  { code: "DM", name: "Dominica", dialCode: "+1", flag: "🇩🇲", maxLength: 7 },
  { code: "KN", name: "St. Kitts and Nevis", dialCode: "+1", flag: "🇰🇳", maxLength: 7 },
  { code: "BW", name: "Botswana", dialCode: "+267", flag: "🇧🇼", maxLength: 7 },
  { code: "MW", name: "Malawi", dialCode: "+265", flag: "🇲🇼", maxLength: 7 },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: "🇿🇲", maxLength: 9 },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "🇿🇼", maxLength: 9 },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿", maxLength: 9 },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬", maxLength: 9 },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", maxLength: 9 },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: "🇧🇮", maxLength: 8 },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹", maxLength: 9 },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: "🇸🇩", maxLength: 9 },
  { code: "LY", name: "Libya", dialCode: "+218", flag: "🇱🇾", maxLength: 9 },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳", maxLength: 8 },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿", maxLength: 9 },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦", maxLength: 9 },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬", maxLength: 10 },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱", maxLength: 9 },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴", maxLength: 9 },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", maxLength: 9 },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", maxLength: 9 },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦", maxLength: 8 },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭", maxLength: 8 },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼", maxLength: 8 },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲", maxLength: 8 },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: "🇾🇪", maxLength: 9 },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶", maxLength: 9 },
  { code: "IR", name: "Iran", dialCode: "+98", flag: "🇮🇷", maxLength: 10 },
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫", maxLength: 9 },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰", maxLength: 10 },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", maxLength: 10 },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", maxLength: 9 },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: "🇲🇲", maxLength: 9 },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭", maxLength: 9 },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳", maxLength: 9 },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", maxLength: 10 },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", maxLength: 9 },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", maxLength: 8 },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", maxLength: 11 },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", maxLength: 9 },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: "🇫🇯", maxLength: 7 },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: "🇵🇬", maxLength: 8 },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", flag: "🇸🇧", maxLength: 7 },
  { code: "VU", name: "Vanuatu", dialCode: "+678", flag: "🇻🇺", maxLength: 7 },
  { code: "NC", name: "New Caledonia", dialCode: "+687", flag: "🇳🇨", maxLength: 6 },
  { code: "PF", name: "French Polynesia", dialCode: "+689", flag: "🇵🇫", maxLength: 6 },
  { code: "WS", name: "Samoa", dialCode: "+685", flag: "🇼🇸", maxLength: 7 },
  { code: "TO", name: "Tonga", dialCode: "+676", flag: "🇹🇴", maxLength: 5 },
  { code: "KI", name: "Kiribati", dialCode: "+686", flag: "🇰🇮", maxLength: 5 },
  { code: "FM", name: "Micronesia", dialCode: "+691", flag: "🇫🇲", maxLength: 7 },
  { code: "MH", name: "Marshall Islands", dialCode: "+692", flag: "🇲🇭", maxLength: 7 },
  { code: "PW", name: "Palau", dialCode: "+680", flag: "🇵🇼", maxLength: 7 },
  { code: "NR", name: "Nauru", dialCode: "+674", flag: "🇳🇷", maxLength: 7 },
  { code: "TV", name: "Tuvalu", dialCode: "+688", flag: "🇹🇻", maxLength: 5 },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  required = false,
  className,
  label,
  error,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    // Try to load from session storage first
    const savedCode = sessionStorage.getItem("cynda-phone-country");
    if (savedCode) {
      const saved = countries.find(c => c.code === savedCode);
      if (saved) return saved;
    }
    
    // Try to detect user's country from browser locale, default to Ghana
    const locale = navigator.language || "en-US";
    const localeCountry = locale.split("-")[1]?.toUpperCase();
    
    const detectedCountry = countries.find(c => c.code === localeCountry);
    return detectedCountry || countries.find(c => c.code === "GH") || countries[0];
  });
  
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Extract phone number from full value if provided
    if (value && value.startsWith(selectedCountry.dialCode)) {
      return value.replace(selectedCountry.dialCode, "").replace(/\s/g, "");
    }
    return "";
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Update the full phone number when country or phone number changes
  useEffect(() => {
    const fullNumber = phoneNumber ? `${selectedCountry.dialCode} ${phoneNumber}` : "";
    onChange?.(fullNumber);
  }, [selectedCountry, phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const maxLength = selectedCountry.maxLength || 15;
    const truncatedValue = value.slice(0, maxLength);
    setPhoneNumber(truncatedValue);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    sessionStorage.setItem("cynda-phone-country", country.code);
    setIsOpen(false);
    setSearchQuery("");
    
    // Adjust phone number if it exceeds new country's max length
    if (phoneNumber.length > (country.maxLength || 15)) {
      setPhoneNumber(phoneNumber.slice(0, country.maxLength || 15));
    }
  };

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlaceholder = () => {
    const exampleLength = Math.min(7, selectedCountry.maxLength || 7);
    const example = "0".repeat(exampleLength);
    return example;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        {/* Country Selector */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 h-14 px-3 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
              disabled={disabled}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-black uppercase tracking-wider">
                {selectedCountry.dialCode}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search country or code..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 focus:ring-0"
              />
              <CommandList>
                <ScrollArea className="h-64">
                  {filteredCountries.length === 0 ? (
                    <CommandEmpty>No country found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredCountries.map((country) => (
                        <CommandItem
                          key={country.code}
                          onSelect={() => handleCountrySelect(country)}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{country.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {country.dialCode}
                            </div>
                          </div>
                          {selectedCountry.code === country.code && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder={getPlaceholder()}
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
            disabled={disabled}
            required={required}
          />
        </div>
      </div>
      
      {error && (
        <p className="text-[11px] font-bold text-destructive">{error}</p>
      )}
      
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
        Format: {selectedCountry.dialCode} {getPlaceholder()}
      </p>
    </div>
  );
};

export default PhoneInput;
