import React, { useLayoutEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, Alert, Platform, StyleSheet } from 'react-native';
import { Button, List, Divider } from 'react-native-paper';
import { CombinedSubmission } from '../frankenweb-ng/frankenweb-rn/shared/types/databaseobjects';
import { useAuth } from '../frankenweb-ng/frankenweb-rn/src/context/AuthContext';
import { layout } from '../frankenweb-ng/frankenweb-rn/src/styles/layout';

// Mock admin user
const mockUser = {
    user_id: 'ADMIN001',
    first_name: 'Admin',
    last_name: 'User',
    role: 1,
};

// Mock submissions
const mockSubmissions: CombinedSubmission[] = [
    { submission_id: 1, first_name: 'Alice', last_name: 'Smith', score: 85 },
    { submission_id: 2, first_name: 'Bob', last_name: 'Jones', score: 92 },
    { submission_id: 3, first_name: 'Charlie', last_name: 'Lee', score: 78 },
];

type AdminScreenMockProps = { navigation: any };

const AdminScreenMock: React.FC<AdminScreenMockProps> = ({ navigation }) => {
    // hide native header on web
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: Platform.OS !== 'web' });
    }, [navigation]);

    // use mock user and data
    const { logout } = useAuth();
    const currentUser = mockUser;
    const [submissions] = useState<CombinedSubmission[]>(mockSubmissions);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        Alert.alert('Mock Delete', `Pretending to delete submission ${id}`);
    };

    if (currentUser.role !== 1) {
        return (
            <View style={layout.centered}>
                <Text style={styles.noPermission}>You do not have permission to access this page.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Image source={require('../frankenweb-ng/frankenweb-rn/assets/frankenweb-logo-v1.png')} style={styles.logo} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('User')}>
                    <Text style={styles.navLink}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
                    <Text style={styles.navLink}>Leaderboard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.navLink}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
                    <Text style={[styles.navLink, styles.activeNavLink]}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={[layout.containerPadded, { backgroundColor: '#061811' }]}>
                <Text style={styles.pageTitle}>Admin Dashboard</Text>
                <Divider style={styles.divider} />
                <Text style={styles.sectionTitle}>All Submissions</Text>

                {submissions.length === 0 ? (
                    <Text style={styles.emptyText}>No submissions available.</Text>
                ) : (
                    submissions.map(sub => (
                        <List.Item
                            key={sub.submission_id}
                            title={`${sub.first_name} ${sub.last_name}`}
                            description={`ID: ${sub.submission_id} | Score: ${sub.score}`}
                            titleStyle={styles.submissionTitle}
                            descriptionStyle={styles.submissionDesc}
                            left={props => <List.Icon {...props} icon="file-document" color="#EAEAEA" />}
                            right={() => (
                                <Button
                                    mode="outlined"
                                    style={styles.deleteButton}
                                    labelStyle={styles.deleteButtonLabel}
                                    onPress={() => handleDelete(sub.submission_id)}
                                    loading={isDeleting === sub.submission_id}
                                    disabled={isDeleting !== null}
                                >
                                    Delete
                                </Button>
                            )}
                        />
                    ))
                )}

                <Button mode="contained" style={styles.refreshBtn} onPress={() => { /* mock refresh */ }}>
                    Refresh
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 30,
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
    pageTitle: {
        fontSize: 40,
        fontFamily: 'YoungFrankExpand',
        color: '#88AB57',
        textAlign: 'center',
        marginVertical: 20,
    },
    divider: {
        backgroundColor: '#444',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#88AB57',
        marginVertical: 10,
    },
    submissionTitle: {
        color: '#EAEAEA',
        fontSize: 18,
    },
    submissionDesc: {
        color: '#CCCCCC',
        fontSize: 14,
    },
    emptyText: {
        color: '#AAAAAA',
        textAlign: 'center',
        marginVertical: 20,
    },
    deleteButton: {
        borderColor: '#E53935',
        borderWidth: 1,
        marginRight: 8,
    },
    deleteButtonLabel: {
        color: '#E53935',
        fontFamily: 'YoungFrankExpand',
        fontSize: 16,
    },
    refreshBtn: {
        marginTop: 20,
        backgroundColor: '#88AB57',
    },
    noPermission: {
        fontSize: 18,
        textAlign: 'center',
        color: '#EAEAEA',
    },
});

export default AdminScreenMock;
