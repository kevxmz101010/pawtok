import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DropDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/?user=root&password=root");
            Statement stmt = conn.createStatement();
            stmt.executeUpdate("DROP DATABASE IF EXISTS pawtok");
            stmt.executeUpdate("CREATE DATABASE pawtok");
            System.out.println("DB Reset");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
