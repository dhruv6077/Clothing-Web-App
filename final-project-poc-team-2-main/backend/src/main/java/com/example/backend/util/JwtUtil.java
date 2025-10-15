
package com.example.backend.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import com.example.backend.model.User;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}") // in milliseconds
    private long expiration;

    public String generateToken(User user) {
    if (user.getId() == null) {
        throw new IllegalArgumentException("User ID is null. Ensure the user is saved and the ID is generated.");
    }
    System.out.println("Generating token for user ID: " + user.getId());
    System.out.println("Secret: " + secret);
    System.out.println("Expiration: " + expiration);
    
    return Jwts.builder()
               .setSubject(user.getId().toString())
               .claim("email", user.getEmail())
               .setIssuedAt(new Date())
               .setExpiration(new Date(System.currentTimeMillis() + expiration))
               .signWith(SignatureAlgorithm.HS512, secret)
               .compact();
}

}
