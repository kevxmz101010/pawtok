import java.sql.*;
public class CheckColumns {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/pawtok", "root", "root")) {
            DatabaseMetaData meta = conn.getMetaData();
            ResultSet rs = meta.getColumns(null, null, "mascotas", null);
            while (rs.next()) {
                System.out.println(rs.getString("COLUMN_NAME") + " | " + rs.getString("TYPE_NAME") + " | " + rs.getInt("COLUMN_SIZE"));
            }
        }
    }
}
