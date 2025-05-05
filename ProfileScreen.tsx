import React, { useLayoutEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';
import { layout } from '../styles/layout';

// Mock user for preview without database
const mockUser = {
    image_url: 'https://i.pravatar.cc/150?img=3',
    first_name: 'Alex',
    last_name: 'Johnson',
    email: 'alex.johnson@example.com',
    user_id: 'USER12345',
    role: 1, // 1 = admin, 0 = regular user
};

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: Platform.OS !== 'web' });
    }, [navigation]);

    const { currentUser, logout } = useAuth();
    const user = currentUser ?? mockUser;

    if (!user) {
        return (
            <View style={[layout.centered, styles.unauthContainer]}>
                <Text style={styles.unauthText}>You need to be logged in to view this page</Text>
                <Button
                    mode="contained"
                    buttonColor="#88AB57"
                    labelStyle={styles.loginButtonLabel}
                    onPress={() => navigation.navigate({ name: 'Login', params: {} })}
                    style={styles.loginButton}
                >
                    Go to Login
                </Button>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Image source={require('../../assets/frankenweb-logo-v1.png')} style={styles.logo} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('User')}>
                    <Text style={styles.navLink}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
                    <Text style={styles.navLink}>Leaderboard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={[styles.navLink, styles.activeNavLink]}>Profile</Text>
                </TouchableOpacity>
                {user.role === 1 && (
                    <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
                        <Text style={styles.navLink}>Admin</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={[layout.containerPadded, { backgroundColor: '#061811' }]}>
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        {user.image_url ? (
                            <Image style={styles.profileImage} source={{ uri: user.image_url }} />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Text style={styles.profileImagePlaceholderText}>
                                    {user.first_name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>User ID</Text>
                        <Text style={styles.infoValue}>{user.user_id}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                    </View>
                </View>

                <Button
                    mode="contained"
                    buttonColor="#88AB57"
                    labelStyle={styles.buttonLabel}
                    onPress={() => navigation.navigate('User')}
                    style={styles.actionButton}
                    uppercase={false}
                >
                    My Submissions
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#061811',
    },
    contentContainer: {
        padding: 30,
    },
    unauthContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#061811',
    },
    unauthText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    loginButton: {
        marginTop: 20,
    },
    loginButtonLabel: {
        color: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 12,
    },
    navLink: {
        fontSize: 40,
        lineHeight: 40,
        fontFamily: 'YoungFrankExpand',
        color: '#88AB57',
        marginHorizontal: 12,
    },
    activeNavLink: {
        textDecorationLine: 'underline',
    },
    signOutBtn: {
        marginLeft: 'auto',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 32,
        backgroundColor: '#88AB57',
    },
    signOutText: {
        color: '#FFFFFF',
        fontFamily: 'YoungFrankExpand',
        fontSize: 18,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EAEAEA',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        backgroundColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImagePlaceholderText: {
        fontSize: 40,
        color: '#061811',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontFamily: 'YoungFrankExpand',
        color: '#EAEAEA',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 16,
        color: '#EAEAEA',
        marginBottom: 8,
    },
    adminBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#88AB57',
    },
    adminBadgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    divider: {
        marginVertical: 20,
        backgroundColor: '#EAEAEA',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EAEAEA',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    infoLabel: {
        fontSize: 16,
        color: '#EAEAEA',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#EAEAEA',
    },
    actionButton: {
        marginBottom: 30,
        borderRadius: 32,
    },
    buttonLabel: {
        color: '#FFFFFF',
        fontFamily: 'YoungFrankExpand',
        fontSize: 18,
    },
});

export default ProfileScreen;