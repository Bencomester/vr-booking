package com.bencomester.vr_booking.config;

import com.bencomester.vr_booking.data.entity.UserEntity;
import com.bencomester.vr_booking.data.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@NullMarked
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String roleName = (user.getRole() != null && user.getRole().getName() != null)
                ? user.getRole().getName().name()
                : "USER";

        return new User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + roleName))
        );
    }
}
