using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class NotEqual : CompareAttribute
    {
        public NotEqual(string otherProperty)
            : base(otherProperty)
        {

        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value != null)
            {

                IComparable comparable = value as IComparable;

                if (comparable == null)
                    throw new InvalidOperationException("The comparison value must implement System.IComparable interface.");

                object otherValue = GetValue(validationContext);

                bool result = !comparable.Equals(otherValue);

                if (result)
                {
                    return null;
                }
                else
                {
                    return new ValidationResult(ErrorMessage);
                }

            }
            return null;
        }

        protected object GetValue(ValidationContext validationContext)
        {
            Type type = validationContext.ObjectType;
            PropertyInfo property = type.GetProperty(OtherProperty, BindingFlags.Public | BindingFlags.Instance | BindingFlags.GetProperty);

            if (property == null)
                throw new InvalidOperationException(String.Format("Type {0} does not contains public instance property {1}.", type.FullName, OtherProperty));

            if (property.GetIndexParameters().Length > 0)
                throw new NotSupportedException("Property with indexer parameters is not supported.");

            var value = property.GetValue(validationContext.ObjectInstance);

            return value;
        }
    }
}
