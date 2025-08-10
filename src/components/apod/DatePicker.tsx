import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const MIN_DATE = new Date("1995-06-16");

type DatePickerProps = {
  date: Date;
  onChange: (date: Date) => void;
};

export const DatePicker = ({ date, onChange }: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="glass" className="w-[220px] justify-start" aria-label="Pick date">
          <CalendarIcon />
          {format(date, "PPP")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => { if (d) { onChange(d); setOpen(false); } }}
          initialFocus
          disabled={(d) => d < MIN_DATE || d > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
};
