import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Platform, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useClassroom } from '../context/ClassroomContext';
import { Submission } from '../../shared/types/databaseobjects';
import { CodeRunInfo } from '../../shared/types/coderuninfo';
import FileUpload from '../components/FileUpload';
import ResultsPlot from '../components/ResultsPlot';
import { useTheme } from '../styles/ThemeContext';
import { layout } from '../styles/layout';
import { API_BASE_URL, API_ROUTES, getAuthHeaders } from '../../client/config';

const UserScreen = ({ navigation }) => {
    // Hide native header on web, show on mobile
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: Platform.OS !== 'web' });
    }, [navigation]);

    const { currentUser } = useAuth();
    const { selectedAssignment } = useClassroom();
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<CodeRunInfo | null>(null);
    const [submissionInfo, setSubmissionInfo] = useState<Submission[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSubmissions = async () => {
        if (!currentUser?.user_id || !selectedAssignment?.assignment_id) return;

        setIsLoading(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/submissions/user/${currentUser.user_id}/assignment/${selectedAssignment.assignment_id}`, {
                headers
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch submissions: ${response.status}`);
            }

            const data = await response.json();
            const submissions = data.data || [];

            setSubmissionInfo(submissions);

            if (submissions && submissions.length > 0) {
                setSubmitted(true);

                try {
                    const parsedResults = JSON.parse(submissions[0].results) as CodeRunInfo;
                    setResults(parsedResults);
                } catch (err) {
                    console.log("Error parsing results:", err);
                    setResults(null);
                }
            } else {
                setSubmitted(false);
                setResults(null);
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.user_id && selectedAssignment?.assignment_id) {
            fetchSubmissions();
        }
    }, [currentUser, selectedAssignment]);

    const deleteSubmission = async (submissionId: number) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(API_ROUTES.submissions.delete(submissionId), {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`Failed to delete submission: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting submission:', error);
            throw error;
        }
    };

    const handleDeleteSubmission = async (submissionId: number) => {
        if (Platform.OS === 'web') {
            if (!confirm('Are you sure you want to delete this submission?')) {
                return;
            }
        } else {
            // For mobile, use Alert
            Alert.alert(
                'Confirm Deletion',
                'Are you sure you want to delete this submission?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => performDelete(submissionId)
                    }
                ]
            );
            return;
        }

        performDelete(submissionId);
    };

    const performDelete = async (submissionId: number) => {
        setIsDeleting(true);
        try {
            await deleteSubmission(submissionId);

            // Refresh the submissions list
            await fetchSubmissions();
        } catch (error) {
            console.error("Error deleting submission:", error);

            if (Platform.OS === 'web') {
                alert('Failed to delete submission. Please try again.');
            } else {
                Alert.alert('Error', 'Failed to delete submission. Please try again.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (!selectedAssignment) {
        return (
            <View style={layout.centered}>
                <Text>Please select an assignment from the classroom screen.</Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={layout.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View style={layout.centered}>
                <Text>Please log in to access this page.</Text>
            </View>
        );
    }

    if (submitted && results) {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#061811' }} contentContainerStyle={layout.containerPadded}>
                <Text style={styles.title}>User</Text>
                <Text style={styles.assignmentTitle}>{selectedAssignment.title}</Text>
                {selectedAssignment.description && (
                    <Text style={styles.description}>{selectedAssignment.description}</Text>
                )}
                {selectedAssignment.due_date && (
                    <Text style={styles.dueDate}>Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</Text>
                )}

                <ResultsPlot results={results} />

                <Button
                    mode="contained"
                    style={styles.deleteButton}
                    labelStyle={styles.deleteButtonLabel}
                    onPress={() => handleDeleteSubmission(submissionInfo[0].submission_id)}
                    loading={isDeleting}
                    disabled={isDeleting}
                >
                    Delete Submission
                </Button>
            </ScrollView>
        );
    } else if (submitted) {
        return (
            <View style={[layout.containerPadded, { backgroundColor: '#061811' }]}>
                <Text style={styles.title}>User</Text>
                <Text style={styles.assignmentTitle}>{selectedAssignment.title}</Text>
                {selectedAssignment.description && (
                    <Text style={styles.description}>{selectedAssignment.description}</Text>
                )}
                {selectedAssignment.due_date && (
                    <Text style={styles.dueDate}>Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</Text>
                )}

                <Text style={{ textAlign: 'center', marginBottom: 20, color: 'white' }}>
                    Your submission is being processed. Results will be displayed when available.
                </Text>

                <Button
                    mode="contained"
                    style={styles.deleteButton}
                    labelStyle={styles.deleteButtonLabel}
                    onPress={() => handleDeleteSubmission(submissionInfo[0].submission_id)}
                    loading={isDeleting}
                    disabled={isDeleting}
                >
                    Delete Submission
                </Button>
            </View>
        );
    } else {
        return (
            <View style={[layout.containerPadded, { backgroundColor: '#061811' }]}>
                <Text style={styles.title}>User</Text>
                <Text style={styles.assignmentTitle}>{selectedAssignment.title}</Text>
                {selectedAssignment.description && (
                    <Text style={styles.description}>{selectedAssignment.description}</Text>
                )}
                {selectedAssignment.due_date && (
                    <Text style={styles.dueDate}>Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</Text>
                )}

                <Text style={styles.uploadTitle}>Upload Your File</Text>
                <FileUpload />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    title: {
        fontSize: 40,
        textAlign: 'center',
        fontFamily: 'YoungFrankExpand',
        color: '#88AB57',
        marginBottom: 20,
    },
    assignmentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    description: {
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    dueDate: {
        marginBottom: 20,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#FFFFFF',
    },
    uploadTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    deleteButton: {
        alignSelf: 'center',
        borderRadius: 24,
        backgroundColor: '#E63939',
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginTop: 20,
    },
    deleteButtonLabel: {
        color: '#FFFFFF',
        fontFamily: 'YoungFrankExpand',
        fontSize: 20,
    },
});

export default UserScreen;
