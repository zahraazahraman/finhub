<?php
require_once __DIR__ . '/../dal/DashboardDAL.php';

class DashboardBLL {
    private DashboardDAL $dal;

    public function __construct() {
        $this->dal = new DashboardDAL();
    }

    public function getSummary(int $year, ?string $from, ?string $to): array {
        $userCounts     = $this->dal->getUserCounts($from, $to);
        $timeline       = $this->dal->getUserRegistrationTimeline($year);
        $recentUsers    = $this->dal->getRecentUsers(5);
        $recentNotifs   = $this->dal->getRecentAdminNotifications(5);
        $availableYears = $this->dal->getAvailableYears();

        // Fill all 12 months
        $months     = [];
        $monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                       'Jul','Aug','Sep','Oct','Nov','Dec'];
        $timelineMap = array_column($timeline, 'count', 'month');
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'month' => $monthNames[$m - 1],
                'users' => (int)($timelineMap[$m] ?? 0),
            ];
        }

        return [
            'success' => true,
            'stats'   => [
                'users' => [
                    'total'     => (int)$userCounts['total'],
                    'active'    => (int)$userCounts['active'],
                    'inactive'  => (int)$userCounts['inactive'],
                    'suspended' => (int)$userCounts['suspended'],
                ],
                'consultants'          => $this->dal->getConsultantCount(),
                'categories'           => $this->dal->getCategoryCount(),
                'unread_notifications' => $this->dal->getUnreadUserNotificationsCount(),
            ],
            'timeline'             => $months,
            'recent_users'         => $recentUsers,
            'recent_notifications' => $recentNotifs,
            'available_years'      => $availableYears,
            'filters'              => [
                'from' => $from,
                'to'   => $to,
                'year' => $year,
            ],
        ];
    }
}