using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace IPS.Fx.Security.Hash
{
    public class HashProvider
    {
        public string Hash(string plainText, HashAlgorithmEnum algorithm = HashAlgorithmEnum.SHA256)
        {
            return Encoding.UTF8.GetString(HashBytes(plainText, algorithm));
        }

        public byte[] HashBytes(string plainText, HashAlgorithmEnum algorithm = HashAlgorithmEnum.SHA256)
        {
            HashAlgorithm hashAlgorithm = CreateHashAlgorithm(algorithm);
            return hashAlgorithm.ComputeHash(Encoding.UTF8.GetBytes(plainText));
        }


        public bool CompareHash(string plainText, string hashedText, HashAlgorithmEnum algorithm = HashAlgorithmEnum.SHA256)
        {
            string hashedPlainText = Hash(plainText, algorithm);
            return hashedPlainText == hashedText;
        }

        private HashAlgorithm CreateHashAlgorithm(HashAlgorithmEnum algorithm)
        {
            HashAlgorithm hashAlgorithm;

            switch (algorithm)
            {
                case HashAlgorithmEnum.MD5:
                    hashAlgorithm = MD5.Create();
                    break;
                case HashAlgorithmEnum.RIPEMD160:
                    hashAlgorithm = RIPEMD160.Create();
                    break;
                case HashAlgorithmEnum.MACTripleDES:
                    hashAlgorithm = MACTripleDES.Create();
                    break;
                case HashAlgorithmEnum.SHA1:
                    hashAlgorithm = SHA1.Create();
                    break;
                case HashAlgorithmEnum.SHA256:
                    hashAlgorithm = SHA256.Create();
                    break;
                case HashAlgorithmEnum.SHA384:
                    hashAlgorithm = SHA384.Create();
                    break;
                default:
                    hashAlgorithm = SHA512.Create();
                    break;
            }

            return hashAlgorithm;
        }
    }
}
