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
  currency: string;
  currencySymbol: string;
}

const countries: Country[] = [
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", maxLength: 9, currency: "GHS", currencySymbol: "GH₵" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", maxLength: 10, currency: "USD", currencySymbol: "$" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", maxLength: 10, currency: "GBP", currencySymbol: "£" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", maxLength: 10, currency: "NGN", currencySymbol: "₦" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", maxLength: 9, currency: "KES", currencySymbol: "KSh" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", maxLength: 9, currency: "ZAR", currencySymbol: "R" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", maxLength: 9, currency: "EUR", currencySymbol: "€" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", maxLength: 10, currency: "EUR", currencySymbol: "€" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", maxLength: 10, currency: "EUR", currencySymbol: "€" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸", maxLength: 9, currency: "EUR", currencySymbol: "€" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", maxLength: 10, currency: "CAD", currencySymbol: "C$" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", maxLength: 9, currency: "AUD", currencySymbol: "A$" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", maxLength: 10, currency: "JPY", currencySymbol: "¥" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳", maxLength: 11, currency: "CNY", currencySymbol: "¥" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", maxLength: 10, currency: "INR", currencySymbol: "₹" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", maxLength: 11, currency: "BRL", currencySymbol: "R$" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", maxLength: 10, currency: "MXN", currencySymbol: "Mex$" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷", maxLength: 10, currency: "ARS", currencySymbol: "$" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱", maxLength: 9, currency: "CLP", currencySymbol: "$" },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪", maxLength: 9, currency: "PEN", currencySymbol: "S/." },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴", maxLength: 10, currency: "COP", currencySymbol: "$" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪", maxLength: 10, currency: "VES", currencySymbol: "Bs." },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨", maxLength: 9, currency: "USD", currencySymbol: "$" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾", maxLength: 8, currency: "UYU", currencySymbol: "$U" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾", maxLength: 9, currency: "PYG", currencySymbol: "₲" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴", maxLength: 8, currency: "BOB", currencySymbol: "Bs" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺", maxLength: 8, currency: "CUP", currencySymbol: "₱" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", maxLength: 8, currency: "CRC", currencySymbol: "₡" },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦", maxLength: 8, currency: "USD", currencySymbol: "$" },
  { code: "DO", name: "Dominican Republic", dialCode: "+1", flag: "🇩🇴", maxLength: 10, currency: "DOP", currencySymbol: "RD$" },
  { code: "HT", name: "Haiti", dialCode: "+509", flag: "🇭🇹", maxLength: 8, currency: "HTG", currencySymbol: "G" },
  { code: "JM", name: "Jamaica", dialCode: "+1", flag: "🇯🇲", maxLength: 7, currency: "JMD", currencySymbol: "J$" },
  { code: "TT", name: "Trinidad and Tobago", dialCode: "+1", flag: "🇹🇹", maxLength: 7, currency: "TTD", currencySymbol: "TT$" },
  { code: "BB", name: "Barbados", dialCode: "+1", flag: "🇧🇧", maxLength: 7, currency: "BBD", currencySymbol: "$" },
  { code: "BS", name: "Bahamas", dialCode: "+1", flag: "🇧🇸", maxLength: 7, currency: "BSD", currencySymbol: "B$" },
  { code: "GD", name: "Grenada", dialCode: "+1", flag: "🇬🇩", maxLength: 7, currency: "XCD", currencySymbol: "$" },
  { code: "LC", name: "St. Lucia", dialCode: "+1", flag: "🇱🇨", maxLength: 7, currency: "XCD", currencySymbol: "$" },
  { code: "VC", name: "St. Vincent and the Grenadines", dialCode: "+1", flag: "🇻🇨", maxLength: 7, currency: "XCD", currencySymbol: "$" },
  { code: "AG", name: "Antigua and Barbuda", dialCode: "+1", flag: "🇦🇬", maxLength: 7, currency: "XCD", currencySymbol: "$" },
  { code: "DM", name: "Dominica", dialCode: "+1", flag: "🇩🇲", maxLength: 7, currency: "XCD", currencySymbol: "$" },
  { code: "KN", name: "St. Kitts and Nevis", dialCode: "+1", flag: "🇰🇳", maxLength: 7, currency: "XCD", currencySymbol: "$" },
  { code: "BW", name: "Botswana", dialCode: "+267", flag: "🇧🇼", maxLength: 7, currency: "BWP", currencySymbol: "P" },
  { code: "MW", name: "Malawi", dialCode: "+265", flag: "🇲🇼", maxLength: 7, currency: "MWK", currencySymbol: "MK" },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: "🇿🇲", maxLength: 9, currency: "ZMW", currencySymbol: "K" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "🇿🇼", maxLength: 9, currency: "ZWL", currencySymbol: "$" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿", maxLength: 9, currency: "TZS", currencySymbol: "TSh" },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬", maxLength: 9, currency: "UGX", currencySymbol: "USh" },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", maxLength: 9, currency: "RWF", currencySymbol: "FRw" },
  { code: "BI", name: "Burundi", dialCode: "+257", flag: "🇧🇮", maxLength: 8, currency: "BIF", currencySymbol: "FBu" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹", maxLength: 9, currency: "ETB", currencySymbol: "Br" },
  { code: "SD", name: "Sudan", dialCode: "+249", flag: "🇸🇩", maxLength: 9, currency: "SDG", currencySymbol: "£" },
  { code: "LY", name: "Libya", dialCode: "+218", flag: "🇱🇾", maxLength: 9, currency: "LYD", currencySymbol: "LD" },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳", maxLength: 8, currency: "TND", currencySymbol: "DT" },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿", maxLength: 9, currency: "DZD", currencySymbol: "DA" },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦", maxLength: 9, currency: "MAD", currencySymbol: "DH" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬", maxLength: 10, currency: "EGP", currencySymbol: "£" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱", maxLength: 9, currency: "ILS", currencySymbol: "₪" },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴", maxLength: 9, currency: "JOD", currencySymbol: "JD" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", maxLength: 9, currency: "SAR", currencySymbol: "SR" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", maxLength: 9, currency: "AED", currencySymbol: "د.إ" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦", maxLength: 8, currency: "QAR", currencySymbol: "QR" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭", maxLength: 8, currency: "BHD", currencySymbol: "BD" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼", maxLength: 8, currency: "KWD", currencySymbol: "KD" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲", maxLength: 8, currency: "OMR", currencySymbol: "RO" },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: "🇾🇪", maxLength: 9, currency: "YER", currencySymbol: "YER" },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶", maxLength: 9, currency: "IQD", currencySymbol: "ID" },
  { code: "IR", name: "Iran", dialCode: "+98", flag: "🇮🇷", maxLength: 10, currency: "IRR", currencySymbol: "IR" },
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫", maxLength: 9, currency: "AFN", currencySymbol: "Af" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰", maxLength: 10, currency: "PKR", currencySymbol: "Rs" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", maxLength: 10, currency: "BDT", currencySymbol: "৳" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", maxLength: 9, currency: "LKR", currencySymbol: "Rs" },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: "🇲🇲", maxLength: 9, currency: "MMK", currencySymbol: "Ks" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭", maxLength: 9, currency: "THB", currencySymbol: "฿" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳", maxLength: 9, currency: "VND", currencySymbol: "₫" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", maxLength: 10, currency: "PHP", currencySymbol: "₱" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", maxLength: 9, currency: "MYR", currencySymbol: "RM" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", maxLength: 8, currency: "SGD", currencySymbol: "S$" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", maxLength: 11, currency: "IDR", currencySymbol: "Rp" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", maxLength: 9, currency: "NZD", currencySymbol: "NZ$" },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: "🇫🇯", maxLength: 7, currency: "FJD", currencySymbol: "FJ$" },
  { code: "PG", name: "Papua New Guinea", dialCode: "+675", flag: "🇵🇬", maxLength: 8, currency: "PGK", currencySymbol: "K" },
  { code: "SB", name: "Solomon Islands", dialCode: "+677", flag: "🇸🇧", maxLength: 7, currency: "SBD", currencySymbol: "SI$" },
  { code: "VU", name: "Vanuatu", dialCode: "+678", flag: "🇻🇺", maxLength: 7, currency: "VUV", currencySymbol: "VT" },
  { code: "NC", name: "New Caledonia", dialCode: "+687", flag: "🇳🇨", maxLength: 6, currency: "XPF", currencySymbol: "₣" },
  { code: "PF", name: "French Polynesia", dialCode: "+689", flag: "🇵🇫", maxLength: 6, currency: "XPF", currencySymbol: "₣" },
  { code: "WS", name: "Samoa", dialCode: "+685", flag: "🇼🇸", maxLength: 7, currency: "WST", currencySymbol: "WS$" },
  { code: "TO", name: "Tonga", dialCode: "+676", flag: "🇹🇴", maxLength: 5, currency: "TOP", currencySymbol: "T$" },
  { code: "KI", name: "Kiribati", dialCode: "+686", flag: "🇰🇮", maxLength: 5, currency: "AUD", currencySymbol: "A$" },
  { code: "FM", name: "Micronesia", dialCode: "+691", flag: "🇫🇲", maxLength: 7, currency: "USD", currencySymbol: "$" },
  { code: "MH", name: "Marshall Islands", dialCode: "+692", flag: "🇲🇭", maxLength: 7, currency: "USD", currencySymbol: "$" },
  { code: "PW", name: "Palau", dialCode: "+680", flag: "🇵🇼", maxLength: 7, currency: "USD", currencySymbol: "$" },
  { code: "NR", name: "Nauru", dialCode: "+674", flag: "🇳🇷", maxLength: 7, currency: "AUD", currencySymbol: "A$" },
  { code: "TV", name: "Tuvalu", dialCode: "+688", flag: "🇹🇻", maxLength: 5, currency: "AUD", currencySymbol: "A$" },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: Country) => void;
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
  onCountryChange,
  placeholder = "Enter phone number",
  disabled = false,
  required = false,
  className,
  label,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    const savedCode = sessionStorage.getItem("cynda-phone-country");
    if (savedCode) {
      const saved = countries.find(c => c.code === savedCode);
      if (saved) return saved;
    }
    const locale = navigator.language || "en-US";
    const localeCountry = locale.split("-")[1]?.toUpperCase();
    const detectedCountry = countries.find(c => c.code === localeCountry);
    return detectedCountry || countries.find(c => c.code === "GH") || countries[0];
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (value && value.startsWith(selectedCountry.dialCode)) {
      setPhoneNumber(value.replace(selectedCountry.dialCode, "").replace(/\s/g, ""));
    }
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    sessionStorage.setItem("cynda-phone-country", country.code);
    setOpen(false);
    onCountryChange?.(country);
    const newFullNumber = country.dialCode + (phoneNumber ? ` ${phoneNumber}` : "");
    onChange?.(newFullNumber);
    inputRef.current?.focus();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    const maxLength = selectedCountry.maxLength || 15;
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    setPhoneNumber(value);
    const newFullNumber = selectedCountry.dialCode + (value ? ` ${value}` : "");
    onChange?.(newFullNumber);
  };

  const getPlaceholder = () => {
    const exampleLength = Math.min(7, selectedCountry.maxLength || 7);
    return `000${"0".repeat(Math.max(0, exampleLength - 3))}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-xs font-bold uppercase tracking-wider">{label}</Label>}
      <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-card h-12 px-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-9 px-2 rounded-lg"
              disabled={disabled}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-bold">{selectedCountry.dialCode}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-2xl border-border shadow-lg" align="start">
            <Command>
              <CommandInput
                placeholder="Search country or code..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-12 border-0 text-sm"
              />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="max-h-[400px]">
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={country.code}
                        onSelect={() => handleCountrySelect(country)}
                        className="flex items-center gap-3 px-3 py-3 cursor-pointer text-sm"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <div className="flex-1">
                          <div className="font-bold">{country.name}</div>
                          <div className="text-xs text-muted-foreground">{country.dialCode}</div>
                        </div>
                        {selectedCountry.code === country.code && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="h-6 w-px bg-border" />
        <Input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
          required={required}
          className="h-auto border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-bold px-0 py-0"
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-destructive uppercase tracking-wider">{error}</p>
      )}
    </div>
  );
};

export { PhoneInput, countries, type Country };