import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class UpdateRol {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/pawtok?user=root&password=root");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("UPDATE usuarios SET rol = 'REFUGIO' WHERE email IN ('esperanza@pawtok.com', 'amor@pawtok.com', 'refugio@pawtok.com')");
            System.out.println("Role updated successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
