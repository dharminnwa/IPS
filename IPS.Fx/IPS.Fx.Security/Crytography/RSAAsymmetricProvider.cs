using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Configuration;
using System.IO;

namespace IPS.Fx.Security.Crytography
{
    public class RSAAsymmetricProvider
    {
        public string Encrypt(string plainText, string keyFilePath = "")
        {
            RSACryptoServiceProvider cryptoProvider = new RSACryptoServiceProvider();
            cryptoProvider.FromXmlString(GetRSAKey(keyFilePath));

            byte[] encryptedBytes = cryptoProvider.Encrypt(Encoding.UTF8.GetBytes(plainText), true);

            return Convert.ToBase64String(encryptedBytes);
        }

        public string Decrypt(string encryptedText, string keyFilePath = "")
        {
            RSACryptoServiceProvider cryptoProvider = new RSACryptoServiceProvider();
            cryptoProvider.FromXmlString(GetRSAKey(keyFilePath));

            byte[] encryptedBytes = Convert.FromBase64String(encryptedText);

            return Encoding.UTF8.GetString(cryptoProvider.Decrypt(encryptedBytes, true));
        }

        private string GetRSAKey(string keyFilePath = "")
        {
            string RSAKey;

            if (string.IsNullOrWhiteSpace(keyFilePath))
            {
                keyFilePath = ConfigurationManager.AppSettings["RSAKeyFilePath"];
            }

            using (StreamReader fileStream = new StreamReader(keyFilePath))
            {
                RSAKey = fileStream.ReadToEnd();
            }

            return RSAKey;
        }

        public string CreateRSAKey(string keyFilePath, bool exportPrivateKey)
        {
            if (string.IsNullOrWhiteSpace(keyFilePath))
            {
                keyFilePath = ConfigurationManager.AppSettings["RSAKeyFilePath"];
            }

            RSACryptoServiceProvider cryptoProvider = new RSACryptoServiceProvider(Convert.ToInt32(ConfigurationManager.AppSettings["RSAKeySize"]));
            RSAParameters privateParameters = cryptoProvider.ExportParameters(exportPrivateKey);

            string RSAKey = cryptoProvider.ToXmlString(exportPrivateKey);

            using (StreamWriter fileStream = new StreamWriter(keyFilePath))
            {
                fileStream.WriteLine(RSAKey);
            }

            return RSAKey;
        }
    }
}
