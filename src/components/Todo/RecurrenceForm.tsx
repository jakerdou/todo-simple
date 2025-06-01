import { useState, useEffect } from 'react';
import { RRule } from 'rrule';

interface RecurrenceFormProps {
  isRecurring: boolean;
  onChange: (rruleString: string | null) => void;
  initialRRule?: string | null;
}

export default function RecurrenceForm({ isRecurring, onChange, initialRRule }: RecurrenceFormProps) {
  // Recurrence settings
  const [frequency, setFrequency] = useState<string>('WEEKLY');
  const [interval, setInterval] = useState<number>(1);
  const [intervalInputValue, setIntervalInputValue] = useState<string>("1"); // Used for input control
  const [weekdays, setWeekdays] = useState<number[]>([new Date().getDay() || 7]); // Default to current day
  const [monthlyType, setMonthlyType] = useState<'dayOfMonth' | 'dayOfWeek'>('dayOfMonth');
  const [monthDay, setMonthDay] = useState<number>(new Date().getDate()); // Default to current day of month
  
  // For monthly by-weekly-position (e.g., "First Monday")
  const [weekPosition, setWeekPosition] = useState<number>(
    Math.ceil(new Date().getDate() / 7) // Roughly calculate which week of the month this is
  );
  const [weekPositionDay, setWeekPositionDay] = useState<number>(new Date().getDay() || 7);
  
  // For yearly recurrence
  const [yearMonth, setYearMonth] = useState<number>(new Date().getMonth() + 1); // 1-12 for Jan-Dec
  const [yearDay, setYearDay] = useState<number>(new Date().getDate());
  // Parse initial RRule if provided
  useEffect(() => {
    if (initialRRule) {
      try {
        const rule = RRule.fromString(initialRRule);
        
        // Set frequency
        const freqMap: {[key: number]: string} = {
          [RRule.DAILY]: 'DAILY',
          [RRule.WEEKLY]: 'WEEKLY',
          [RRule.MONTHLY]: 'MONTHLY',
          [RRule.YEARLY]: 'YEARLY'
        };
        setFrequency(freqMap[rule.options.freq]);
        
        // Set interval
        if (rule.options.interval) {
          setInterval(rule.options.interval);
        }
        
        // Set weekdays for weekly frequency
        if (rule.options.freq === RRule.WEEKLY && rule.options.byweekday) {
          const weekdayMap: {[key: number]: number} = {
            0: 0, // Sunday
            1: 1, // Monday
            2: 2, // Tuesday
            3: 3, // Wednesday
            4: 4, // Thursday
            5: 5, // Friday
            6: 6  // Saturday
          };
          
          const selectedDays = Array.isArray(rule.options.byweekday) 
            ? rule.options.byweekday.map((day: any) => {
                // RRule can store weekdays as numbers or as objects with a weekday property
                const dayValue = typeof day === 'number' ? day : day.weekday;
                return weekdayMap[dayValue];
              })
            : [];
          
          if (selectedDays.length > 0) {
            setWeekdays(selectedDays);
          }
        }
        
        // Set monthly options
        if (rule.options.freq === RRule.MONTHLY) {
          if (rule.options.bymonthday && rule.options.bymonthday.length > 0) {
            setMonthlyType('dayOfMonth');
            setMonthDay(rule.options.bymonthday[0]);
          } else if (rule.options.byweekday && rule.options.bysetpos) {
            setMonthlyType('dayOfWeek');
            
            // Set the week position (e.g., first, second, third, fourth, last)
            if (Array.isArray(rule.options.bysetpos) && rule.options.bysetpos.length > 0) {
              setWeekPosition(rule.options.bysetpos[0]);
            } else if (typeof rule.options.bysetpos === 'number') {
              setWeekPosition(rule.options.bysetpos);
            }
            
            // Set the weekday (e.g., Monday, Tuesday, etc.)
            const weekdayMap: {[key: number]: number} = {
              0: 0, // Sunday
              1: 1, // Monday
              2: 2, // Tuesday
              3: 3, // Wednesday
              4: 4, // Thursday
              5: 5, // Friday
              6: 6  // Saturday
            };
            
            if (Array.isArray(rule.options.byweekday) && rule.options.byweekday.length > 0) {
              const day = rule.options.byweekday[0];
              const dayValue = typeof day === 'number' ? day : (day as any).weekday;
              setWeekPositionDay(weekdayMap[dayValue]);
            }
          }
        }
        
        // Set yearly options
        if (rule.options.freq === RRule.YEARLY) {
          if (rule.options.bymonth && rule.options.bymonth.length > 0) {
            setYearMonth(rule.options.bymonth[0]);
          }
          
          if (rule.options.bymonthday && rule.options.bymonthday.length > 0) {
            setYearDay(rule.options.bymonthday[0]);
          }
        }
      } catch (error) {
        console.error('Error parsing RRule:', error);
      }
    }
  }, [initialRRule]);

  // Update the input value when interval changes through other means
  useEffect(() => {
    setIntervalInputValue(interval.toString());
  }, [interval]);

  // Build and update the RRule string whenever settings change
  useEffect(() => {
    if (!isRecurring) {
      onChange(null);
      return;
    }

    try {
      // If it's weekly and no days are selected, don't create a rule
      if (frequency === 'WEEKLY' && weekdays.length === 0) {
        onChange(null);
        return;
      }

      let options: any = {
        freq: RRule[frequency as keyof typeof RRule] as number,
        interval: interval
      };

      // Add frequency-specific options
      switch (frequency) {
        case 'WEEKLY':
          // Convert from JavaScript's 0-6 (Sunday-Saturday) to RRule's days
          const byWeekday = weekdays.map(day => {
            const days = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
            return days[day % 7]; // Mod 7 to handle case where day=7 (RRule uses 0-6)
          });
          options.byweekday = byWeekday;
          break;
        
        case 'MONTHLY':
          if (monthlyType === 'dayOfMonth') {
            options.bymonthday = [monthDay];
          } else {
            // For 'dayOfWeek' pattern, use byweekday with a specific week number
            const weekday = {
              0: RRule.SU,
              1: RRule.MO,
              2: RRule.TU,
              3: RRule.WE,
              4: RRule.TH,
              5: RRule.FR,
              6: RRule.SA
            }[weekPositionDay];
            
            // For "last" occurrence
            if (weekPosition === -1) {
              options.bysetpos = -1;
              options.byweekday = [weekday];
            } else {
              // For nth occurrence (1st, 2nd, 3rd, 4th)
              options.bysetpos = weekPosition;
              options.byweekday = [weekday];
            }
          }
          break;
        
        case 'YEARLY':
          options.bymonth = [yearMonth];
          options.bymonthday = [yearDay];
          break;
      }

      const rule = new RRule(options);
      onChange(rule.toString());
    } catch (error) {
      console.error('Error creating RRule:', error);
      onChange(null);
    }
  }, [
    isRecurring, frequency, interval, weekdays, 
    monthlyType, monthDay, weekPosition, weekPositionDay, 
    yearMonth, yearDay, onChange
  ]);

  if (!isRecurring) return null;

  return (
    <div className="mt-4 p-4 rounded-md border border-gray-600 bg-gray-700">
      <h3 className="text-sm font-medium text-white mb-3">Recurrence Pattern</h3>
      
      {/* Frequency Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Repeats
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>

      {/* Interval Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Every
        </label>
        <div className="flex items-center">          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            max="99"
            value={intervalInputValue}
            onChange={(e) => {
              // Allow empty value or valid numbers
              const inputValue = e.target.value;
              setIntervalInputValue(inputValue);
              
              if (inputValue === "") {
                // Input is empty but don't update interval yet
              } else {
                const newValue = parseInt(inputValue);
                if (!isNaN(newValue) && newValue >= 1 && newValue <= 99) {
                  setInterval(newValue);
                }
              }
            }}
            onBlur={() => {
              // On blur, ensure we have a valid value (min 1)
              if (intervalInputValue === "" || parseInt(intervalInputValue) < 1) {
                setIntervalInputValue("1");
                setInterval(1);
              }
            }}
            className="w-16 rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <span className="ml-2 text-sm text-gray-300">
            {frequency === 'DAILY' && (interval > 1 ? 'days' : 'day')}
            {frequency === 'WEEKLY' && (interval > 1 ? 'weeks' : 'week')}
            {frequency === 'MONTHLY' && (interval > 1 ? 'months' : 'month')}
            {frequency === 'YEARLY' && (interval > 1 ? 'years' : 'year')}
          </span>
        </div>
      </div>

      {/* Weekly Options */}
      {frequency === 'WEEKLY' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            On these days {weekdays.length === 0 && <span className="text-red-400 ml-1">(required)</span>}
          </label>
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setWeekdays(prev => {
                    // Don't allow removing the last selected day
                    if (prev.includes(index) && prev.length === 1) {
                      return prev;
                    }
                    return prev.includes(index) 
                      ? prev.filter(d => d !== index)
                      : [...prev, index];
                  });
                }}
                className={`h-8 w-8 rounded-full ${
                  weekdays.includes(index)
                    ? 'bg-blue-600 text-white'
                    : weekdays.length === 0 ? 'bg-gray-600 text-gray-300 border border-red-400' : 'bg-gray-600 text-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Options */}
      {frequency === 'MONTHLY' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Monthly pattern
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="dayOfMonth"
                name="monthlyType"
                checked={monthlyType === 'dayOfMonth'}
                onChange={() => setMonthlyType('dayOfMonth')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-700"
              />
              <label htmlFor="dayOfMonth" className="ml-2 text-sm text-gray-300">
                On day
                <select
                  value={monthDay}
                  onChange={(e) => setMonthDay(parseInt(e.target.value))}
                  className="ml-2 rounded-md border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={monthlyType !== 'dayOfMonth'}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="dayOfWeek"
                name="monthlyType"
                checked={monthlyType === 'dayOfWeek'}
                onChange={() => setMonthlyType('dayOfWeek')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-700"
              />
              <label htmlFor="dayOfWeek" className="ml-2 text-sm text-gray-300 flex items-center">
                On the
                <select
                  value={weekPosition}
                  onChange={(e) => setWeekPosition(parseInt(e.target.value))}
                  className="mx-2 rounded-md border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={monthlyType !== 'dayOfWeek'}
                >
                  <option value="1">first</option>
                  <option value="2">second</option>
                  <option value="3">third</option>
                  <option value="4">fourth</option>
                  <option value="-1">last</option>
                </select>
                <select
                  value={weekPositionDay}
                  onChange={(e) => setWeekPositionDay(parseInt(e.target.value))}
                  className="rounded-md border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={monthlyType !== 'dayOfWeek'}
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Options */}
      {frequency === 'YEARLY' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            On this date
          </label>
          <div className="flex space-x-2">
            <select
              value={yearMonth}
              onChange={(e) => setYearMonth(parseInt(e.target.value))}
              className="rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={yearDay}
              onChange={(e) => setYearDay(parseInt(e.target.value))}
              className="rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Human-readable summary */}
      <div className="mt-5 p-3 bg-gray-800 rounded-md text-sm text-gray-300">
        <div className="font-medium mb-1">Summary:</div>
        <div className="italic">
          {(() => {
            try {
              // For standard frequencies
              if (frequency !== 'MONTHLY' || monthlyType === 'dayOfMonth') {
                const rule = new RRule({
                  freq: RRule[frequency as keyof typeof RRule] as number,
                  interval,
                  byweekday: frequency === 'WEEKLY' 
                    ? weekdays.map(day => {
                        const days = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
                        return days[day % 7];
                      })
                    : undefined,
                  bymonthday: frequency === 'MONTHLY' && monthlyType === 'dayOfMonth' 
                    ? [monthDay] 
                    : frequency === 'YEARLY' 
                      ? [yearDay]
                      : undefined,
                  bymonth: frequency === 'YEARLY' ? [yearMonth] : undefined,
                });
                
                return rule.toText();
              }
              
              // Special handling for "nth weekday of month" since it's not well rendered by toText()
              if (frequency === 'MONTHLY' && monthlyType === 'dayOfWeek') {
                const pos = weekPosition === -1 ? 'last' : 
                  weekPosition === 1 ? 'first' :
                  weekPosition === 2 ? 'second' :
                  weekPosition === 3 ? 'third' : 'fourth';
                const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekPositionDay];
                return `Every ${interval > 1 ? interval + ' ' : ''}month${interval > 1 ? 's' : ''} on the ${pos} ${day}`;
              }
              
              return "Custom recurrence pattern";
            } catch (e) {
              console.error('Error generating summary:', e);
              return "Unable to generate summary";
            }
          })()}
        </div>
      </div>
    </div>
  );
}
