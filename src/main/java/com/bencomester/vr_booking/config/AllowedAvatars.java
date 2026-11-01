package com.bencomester.vr_booking.config;

import java.util.List;
import java.util.Set;

public final class AllowedAvatars {
    public static final String DEFAULT_AVATAR =
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";

    public static final List<String> PRESETS = List.of(
            DEFAULT_AVATAR,
            "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    );

    private static final Set<String> ALLOWED_SET = Set.copyOf(PRESETS);

    private AllowedAvatars() {
    }

    public static boolean isAllowed(String url) {
        return url != null && ALLOWED_SET.contains(url.trim());
    }
}
