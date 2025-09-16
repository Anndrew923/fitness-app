import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.MessageDigest;

public class GetFingerprint {
    public static void main(String[] args) {
        try {
            String keystorePath = "android.keystore";
            String alias = "upload";
            String password = "fitness2025"; // 請替換為你的密碼
            
            KeyStore keystore = KeyStore.getInstance("JKS");
            FileInputStream fis = new FileInputStream(keystorePath);
            keystore.load(fis, password.toCharArray());
            
            Certificate cert = keystore.getCertificate(alias);
            byte[] certBytes = cert.getEncoded();
            
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(certBytes);
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            System.out.println("SHA256 Fingerprint: " + hexString.toString().toUpperCase());
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
