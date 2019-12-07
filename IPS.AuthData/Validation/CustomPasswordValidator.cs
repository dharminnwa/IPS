using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Validation
{
    public class CustomPasswordValidator : PasswordValidator
    {
        public int MaxLength { get; set; }

        public override async Task<IdentityResult> ValidateAsync(string item)
        {
            IdentityResult result = await base.ValidateAsync(item);

            var errors = result.Errors.ToList();

            if (string.IsNullOrEmpty(item) || item.Length > MaxLength)
            {
                errors.Add(string.Format("Password length can't exceed {0}", MaxLength));
            }

            return await Task.FromResult(!errors.Any()
             ? IdentityResult.Success
             : IdentityResult.Failed(errors.ToArray()));
        }
    }
}