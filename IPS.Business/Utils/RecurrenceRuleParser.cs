using DDay.iCal;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace IPS.Business.Utils
{
    public static class RecurrenceRuleParser
    {
        #region Methods


        public static List<DateTime> GetRecurrenceDateTime(string RRule, DateTime RecStartDate, DateTime RecDueDate)
        {
            List<DateTime> dates = new List<DateTime>();
            RecurringComponent recurringComponent = new RecurringComponent();
            if (!string.IsNullOrEmpty(RRule))
            {
                DateTime NewRecStartDate = RecStartDate.AddDays(-1);
                DateTime NewRecDueDate = RecDueDate.AddDays(1);
                if (RRule.IndexOf("FREQ") > -1)
                {
                    RecurrencePattern pattern = new RecurrencePattern(RRule);//RRule is set to a weekly occurrence
                    recurringComponent.RecurrenceRules.Add(pattern);
                    recurringComponent.Start = new iCalDateTime(NewRecStartDate); //The event started from the 6.1
                    var occurrences = recurringComponent.GetOccurrences(
                        NewRecStartDate,
                        //Although we take is 7.1, after the event, but it cannot be written as 2013-7-1, because the function in the calculation is>startTime <=endTime
                        NewRecDueDate); //Won the cycling events in specific time occurred in July

                    foreach (Occurrence occurrence in occurrences)
                    {
                        DateTime occurrenceTime = occurrence.Period.StartTime.Local;
                        Console.WriteLine(occurrenceTime.ToString("yyyy-MM-dd"));
                        if (occurrenceTime < RecDueDate)
                        {
                            dates.Add(occurrenceTime);
                        }
                    }
                }
            }
            return dates;


        }


        public static string ParseRRule(string rRule, bool showExceptions)
        {
            if (!(rRule.IndexOf('*') > -1))
            {
                string parsed = string.Empty;//set up the return string
                StringBuilder englishStatement = new StringBuilder();
                //Break it into basic parts
                string[] elements = rRule.Split(';');
                //it's double spaced in the db, so deal with it accordingly
                //string startDate = elements[0];
                //string endDate = elements[2];
                string recRule = elements[0];
                string recExcs = string.Empty;
                //check for exceptions
                if (elements.Length > 5)
                {
                    recExcs = elements[6];
                }
                //Attempt to parse the zulu dates into something else
                //DateTime dtStart = DateTime.ParseExact(getElemValue(startDate), "yyyyMMddTHHmmssZ", System.Globalization.CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
                //DateTime dtEnd = DateTime.ParseExact(getElemValue(endDate), "yyyyMMddTHHmmssZ", System.Globalization.CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal);
                //TimeSpan tsEnd = dtEnd.Subtract(dtStart);
                //Now work with the recurrence rule
                Dictionary<string, string> rruleElems = new Dictionary<string, string>();
                //Convert the string to a dictionary so we can find things easy
                //parsed = getElemValue(recRule); //no need having unnecessarily declared strings
                //elements = parsed.Split(';');
                for (int i = 0; i < elements.Length; i++)
                {
                    string[] tmp = elements[i].Split('=');
                    if (tmp[0] == "BYDAY")
                    {
                        bool hasdigit = tmp[1].Any(char.IsDigit);
                        if (hasdigit)
                        {
                            long onlyNumbers = Convert.ToInt64(Regex.Replace(tmp[1], "[a-zA-Z]", ""));

                            if (onlyNumbers != 0)
                            {
                                rruleElems.Add("BYSETPOS", onlyNumbers.ToString());
                                tmp[1] = tmp[1].Replace(onlyNumbers.ToString(), "");
                            }
                        }
                    }
                    rruleElems.Add(tmp[0], tmp[1]);
                }
                englishStatement.Append("Occurs " + rruleElems["FREQ"].ToLower());
                string calType = string.Empty; //need a scratchpad
                                               //start translating into English
                int repeatEvery = 0;
                try
                {
                    repeatEvery = Convert.ToInt32(rruleElems["INTERVAL"]);
                }
                catch
                {
                    repeatEvery = 0;
                }
                int timeToAdd = 0;
                try
                {
                    timeToAdd = Convert.ToInt32(rruleElems["COUNT"]);
                }
                catch
                {
                    timeToAdd = 0;
                }
                switch (rruleElems["FREQ"].ToLower())
                {
                    case "daily":
                        {
                            calType = "days";
                            if (rruleElems.ContainsKey("BYDAY"))
                            {
                                string[] days = rruleElems["BYDAY"].Split(',');
                                englishStatement.Append(parseDayNames(days));
                                //dtEnd = dtEnd.AddDays(timeToAdd);

                            }
                            break;
                        }
                    case "weekly":
                        {
                            calType = "weeks";
                            //dtEnd = dtEnd.AddDays(timeToAdd * 7);
                            try
                            {
                                if (rruleElems.ContainsKey("BYDAY"))
                                {
                                    string[] days = rruleElems["BYDAY"].Split(',');
                                    englishStatement.Append(parseDayNames(days));
                                }
                            }
                            catch
                            {
                                //just in case we missed something on this one
                                throw new Exception("Error while processing Recurrence Rule");
                            }
                            break;
                        }
                    case "monthly":
                        {
                            calType = "months";
                            //dtEnd = dtEnd.AddMonths(timeToAdd);
                            //see if it's positional
                            try
                            {
                                if (rruleElems.ContainsKey("BYSETPOS") && rruleElems.ContainsKey("BYDAY"))
                                {
                                    string bsp = getDayEnding(rruleElems["BYSETPOS"]);
                                    englishStatement.Append(" on the " + bsp + " " + parseDayNames(rruleElems["BYDAY"].Split(',')).Replace(" every ", ""));
                                }
                                else if (rruleElems.ContainsKey("BYDAY"))
                                {
                                    englishStatement.Append(" on the " + parseDayNames(rruleElems["BYDAY"].Split(',')).Replace(" every ", ""));
                                }
                            }
                            catch
                            {
                                //Ok, no BYSETPOS, let's go for BYMONTHDAY
                                string bsp = getDayEnding(rruleElems["BYMONTHDAY"]);
                                englishStatement.Append(" on the " + bsp + " day of each month");
                            }
                            break;
                        }
                    case "yearly":
                        {
                            calType = "years";
                            //dtEnd = dtEnd.AddYears(timeToAdd);
                            //looks a lot like monthly....
                            string mName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(Convert.ToInt32(rruleElems["BYMONTH"]));
                            //see if it's positional
                            try
                            {
                                if (rruleElems.ContainsKey("BYSETPOS") && rruleElems.ContainsKey("BYDAY"))
                                {
                                    string bsp = getDayEnding(rruleElems["BYSETPOS"]);
                                    englishStatement.Append(" on the " + bsp + " " + parseDayNames(rruleElems["BYDAY"].Split(',')).Replace(" every ", "") + " of " + mName);
                                }
                                else if (rruleElems.ContainsKey("BYMONTHDAY"))
                                {
                                    string bsp = getDayEnding(rruleElems["BYMONTHDAY"]);
                                    englishStatement.Append(" on the " + bsp + " day of " + mName);
                                }
                            }
                            catch
                            {
                                //Ok, no BYSETPOS, let's go for BYMONTHDAY
                                if (rruleElems.ContainsKey("BYMONTHDAY"))
                                {
                                    string bsp = getDayEnding(rruleElems["BYMONTHDAY"]);
                                    englishStatement.Append(" on the " + bsp + " day of " + mName);
                                }
                            }
                            break;
                        }
                    case "hourly":
                        calType = "hours";
                        //dtEnd = dtEnd.AddHours(timeToAdd);
                        break;
                    default:
                        break;

                }
                //englishStatement.Append(" starting on " + dtStart.ToLocalTime().ToShortDateString() + " at " + dtStart.ToLocalTime().ToShortTimeString());
                if (repeatEvery > 0)
                {
                    englishStatement.Append(" Repear Every " + repeatEvery + " " + calType);
                    //englishStatement.Append(" ending on " + dtEnd.ToLocalTime().ToShortDateString() + " at " + dtStart.AddHours(tsEnd.Hours).ToLocalTime().ToShortTimeString());
                }
                if (timeToAdd > 0)
                {
                    englishStatement.Append(" for the next " + rruleElems["COUNT"] + " " + calType);
                    //englishStatement.Append(" ending on " + dtEnd.ToLocalTime().ToShortDateString() + " at " + dtStart.AddHours(tsEnd.Hours).ToLocalTime().ToShortTimeString());
                }

                if (recExcs.Length > 0 && showExceptions)
                {
                    string[] excs = recExcs.Split(':')[1].Split(','); string retString = string.Empty;
                    englishStatement.Append(" except on ");
                    for (int r = 0; r < excs.Length; r++)
                    {
                        //we'll use dtEnd, it's not doing anything now
                        //dtEnd = DateTime.ParseExact(excs[r], "yyyyMMddTHHmmssZ", System.Globalization.CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal).ToLocalTime();
                        if (r < excs.Length && excs.Length > 2)
                        {
                            //retString += dtEnd + ",";
                        }
                        else
                        {
                            if (r < excs.Length - 1 && excs.Length == 2)
                            {
                                //retString += dtEnd + " and ";
                            }
                            else
                            {
                                //retString += dtEnd;
                            }
                        }
                    }
                    englishStatement.Append(retString);
                }
                return englishStatement.ToString();
            }
            else
            {
                return string.Empty;
            }
        }
        private static string getElemValue(string elem)
        {
            //just easier than writing split all over the place
            string[] elems = elem.Split(':');
            return elems[1].Trim();
        }
        private static string getDayName(string day)
        {
            //pretty self explanatory
            switch (day)
            {
                case "MO":
                    return "Monday";
                case "TU":
                    return "Tuesday";
                case "WE":
                    return "Wednesday";
                case "TH":
                    return "Thursday";
                case "FR":
                    return "Friday";
                case "SA":
                    return "Saturday";
                case "SU":
                    return "Sunday";
                default:
                    return "";
            }
        }
        private static string parseDayNames(string[] days)
        {
            string retString = string.Empty;
            {
                if (days.Length <= 7)
                {
                    retString += " every";
                    for (int d = 0; d < days.Length; d++)
                    {
                        days[d] = getDayName(days[d]);

                        if (d == days.Length - 1 && days.Length > 1)
                        {
                            days[d] = " and " + days[d];
                        }
                        else
                        {
                            if (days.Length > 2)
                            {
                                days[d] += ",";
                            }
                        }
                        retString += " " + days[d];
                    }
                }

                return retString;
            }
        }
        private static string getDayEnding(string d)
        {
            //tried to avoid a big ugly if statement
            //handle the events on the "n"th day of the month
            if (d.EndsWith("1") && d != "11")
            {
                if (d.StartsWith("-"))
                {
                    d = "last";
                }
                else
                {
                    d += "st";
                }
            }
            if (d.EndsWith("2") && d != "12")
            {
                d += "nd";
            }
            if (d.EndsWith("3") && d != "13")
            {
                d += "rd";
            }
            if (d.Length < 3)//hasn't been appended yet
            {
                d += "th";
            }
            return d;
        }
        #endregion
    }
}
