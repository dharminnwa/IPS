//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace IPS.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class Reminder
    {
        public int Id { get; set; }
        public string ReminderText { get; set; }
        public Nullable<System.DateTime> DueDate { get; set; }
        public Nullable<int> UserId { get; set; }
        public Nullable<int> TrainingId { get; set; }
        public Nullable<int> ProfileId { get; set; }
        public Nullable<bool> IsReviewed { get; set; }
        public Nullable<int> ReminderType { get; set; }
    
        public virtual ReminderType ReminderType1 { get; set; }
    }
}