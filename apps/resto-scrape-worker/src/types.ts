export interface ZomatoPageResponse {
	page_data: {
		sections: {
			SECTION_BASIC_INFO: {
				is_perm_closed: boolean;
				is_temp_closed: boolean;
				res_status_text: string;
				timing: {
					show_open_now: boolean;
					customised_timings: {
						opening_hours: Array<{ timing: string; days: string }>;
					};
				};
			};
		};
	};
}
