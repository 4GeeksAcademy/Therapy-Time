const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			consultations: [
				{
					"age": "",
					"arrival_date ": "",
					"arrival_date": "",
					"consultation": "",
					"id": "",
					"is_deleted": false,
					"is_read": false,
					"lastname": "",
					"name": "",
					"phone": ""
				}
			],
			dates: [{
				"date": "",
				"times": []
			}],
			globalEnabled: [{
				"day": "",
				"end_hour": "",
				"id": "",
				"start_hour": ""
			}],
			globalEnabledByDay: [{
				"day": "",
				"end_hour": "",
				"id": "",
				"start_hour": ""
			}],
			patientReservation: {
				"date": "",
				"id": "",
				"user_id": ""
			},
			preferenceId: null,
			reservations: [],
			reservationByID: {},
			unavailableDates: [{
				"date": "",
				"id": "",
				"time": ""
			}],
			user: [
				{
					"dni": "",
					"email": "",
					"id": "",
					"isActive": "",
					"isAuthenticated": false,
					"lastname": "",
					"name": "",
					"password": "",
					"phone": "",
					"reset_token": "",
					"role": "",
					"username": "",
					"virtual_link": ""
				}
			],
			userByDNI: {}
		},
		actions: {
			//ACTIONS GLOBALES
			apiFetch: async (endpoint, method = 'GET', body = null) => {
				try {
					let params = {
						method,
						headers: {
							"Access-Control-Allow-Origin": "*"
						}
					};

					if (body !== null) {
						params.body = JSON.stringify(body);
						params.headers["Content-Type"] = "application/json";
					}
					let resp = await fetch(process.env.BACKEND_URL + "api" + endpoint, params);

					if (!resp.ok) {
						console.error(resp.statusText);
						return { error: resp.statusText };
					}

					return resp
				} catch (error) {
					console.error("Error:", error)
				}
			},
			APIFetch: async (endpoint, method = 'GET', body = null) => {
				try {
					let params = {
						method,
						headers: {
							"Access-Control-Allow-Origin": "*"
						}
					};

					if (body !== null) {
						params.body = JSON.stringify(body);
						params.headers["Content-Type"] = "application/json";
					}
					if (body != null) {
						params.body = JSON.stringify(body)
					}
					let resp = await fetch(process.env.BACKEND_URL + "api" + endpoint, params);

					if (!resp.ok) {
						console.error(resp.statusText);
						return { error: resp.statusText };
					}

					return resp.json()
				} catch (error) {
					console.error("Error:", error)
				}
			},
			protectedFetch: async (endpoint, method = "GET", body = null) => {
				const token = localStorage.getItem("token")
				if (!token) {
					throw new Error("Token not found.");
				}
				try {
					let params = {
						method,
						headers: {
							"Access-Control-Allow-Origin": "*",
							"Authorization": "Bearer " + token
						},
					}
					if (body != null) {
						params.headers["Content-Type"] = "application/json"
						params.body = JSON.stringify(body)
					}
					let resp = await fetch(process.env.BACKEND_URL + "api" + endpoint, params)
					if (!resp.ok) {
						console.error(resp.statusText)
						return { error: resp.statusText }
					}
					return resp
				} catch (error) {
					return error
				}
			},
			//ACTIONS DE LOGIN Y LOGOUT
			logout: async () => {
				await getActions().protectedFetch("/logout", "POST", null)
				localStorage.removeItem("token")
				localStorage.removeItem("data")
			},
			loginUser: async (username, password) => {
				try {
					const response = await getActions().apiFetch('/login', 'POST', {
						username: username,
						password: password
					});

					if (!response.ok) {
						throw new Error('Failed to log in');
					}

					const responseData = await response.json();
					const token = responseData.token || "";
					console.log(responseData)

					localStorage.setItem('token', token);
					localStorage.setItem('data', JSON.stringify(responseData) );
					console.log("Token almacenado en localStorage:", token);
					setStore({ 
						user: responseData,
						isAuthenticated: true
					});
					return { success: true, message: responseData.message };

				} catch (error) {
					console.error("Error al realizar la solicitud:", error);
					const errorMessage = error.message || 'Error de red';
					if (error.response && error.response.status === 404) {
						return { success: false, error: 'El usuario no está registrado' };
					} else if (error.response && error.response.status === 401) {
						return { success: false, error: 'La contraseña es incorrecta' };
					} else {
						return { success: false, error: errorMessage };
					}
				}
			},
			//ACTIONS PARA EL RECUPERO DE CONTRASEÑA
			handleResetPassword: async (email) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + '/api/reset_password', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
						body: JSON.stringify({ email })
					});

					const data = await response.json();
					if (!response.ok) {
						throw new Error(data.error || 'Error al enviar la solicitud');
					}
					return data;
				} catch (error) {
					throw new Error(error.message || 'Error al enviar la solicitud');
				}
			},
			handleChangePassword: async (username, token, newPassword) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + 'api/change_password', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
						body: JSON.stringify({
							username: username,
							token: token,
							new_password: newPassword
						})
					});
					const data = await response.json();

					if (!response.ok) {
						if (response.status === 401) {
							throw new Error(data.mensaje || 'El token ingresado es inválido o ha expirado');
						} else if (response.status === 404) {
							throw new Error(data.mensaje || 'El usuario ingresado es inválido');
						} else {
							throw new Error(data.mensaje || 'Error al cambiar la contraseña');
						}
					}

					return data;
				} catch (error) {
					throw new Error(error.message || 'Error al enviar la solicitud');
				}
			},
			//ACTIONS PARA LA GESTION DE PACIENTES
			createUser: async (body) => {
				try {
					if (!body.username || !body.name || !body.lastname || !body.dni || !body.phone || !body.email) {
						throw new Error("Por favor, complete todos los campos requeridos.");
					}
					const resp = await getActions().protectedFetch("/signup", "POST", body);

					if (resp.ok) {
						const data = await resp.json();
						const newUser = {
							id: data.role_id,
							username: data.username,
							name: data.name,
							lastname: data.lastname,
							dni: data.dni,
							phone: data.phone,
							email: data.email,
							virtual_link: data.virtual_link
						};
						const updatedUserList = [...getStore().user, newUser];
						setStore({ user: updatedUserList });
						return data;
					} else {
						const errorMessage = await resp.text();
						throw new Error(errorMessage || "Error al crear el usuario.");
					}
				} catch (error) {
					console.error("Error creating user:", error);
					throw error;
				}
			},
			getUsers: async () => {
				try {
					const resp = await getActions().protectedFetch("/users", "GET");

					if (resp.ok) {
						const data = await resp.json();
						setStore({ user: data });
						return data;
					} else {
						throw new Error("Error al obtener usuarios.");
					}
				} catch (error) {
					console.error("Error al obtener usuarios:", error.message);
					throw error;
				}
			},
			getUser: async (id) => {
				try {
					const resp = await getActions().protectedFetch(`/get_user/${id}`);
					if (resp.ok) {
						const data = await resp.json();
						return data;
					} else {
						throw new Error("Error al obtener el usuario.");
					}
				} catch (error) {
					console.error("Error al obtener usuarios:", error.message);
					throw error;
				}
			},
			editUser: async (id, userData) => {
				try {
					const resp = await getActions().protectedFetch(`/edit_user/${id}`, 'PUT', userData);
					if (resp.ok) {
						const userIndex = getStore().user.findIndex(user => user.id === id);
						if (userIndex !== -1) {
							const updatedUsers = [...getStore().user];
							updatedUsers[userIndex] = { ...userData, id };
							setStore({ user: updatedUsers });
							return { ...userData, id };
						} else {
							throw new Error('Usuario no encontrado');
						}
					} else {
						throw new Error('Error al editar el usuario');
					}
				} catch (error) {
					console.error("Error al editar el usuario:", error.message);
					throw error;
				}
			},
			//ACTIONS PARA LA EDICION DE PERFIL		
			getUserData: async () => {
				try {
					const resp = await getActions().protectedFetch("/profile", "GET", null)
					if (!resp.ok) {
						console.error("Error al traer datos de usuario: ", resp)
						return { error: "Error al traer datos de usuario" }
					}
					return resp.json()
				} catch (error) {
					console.error("Error: ", error)
					return { error: "Error al traer datos de usuario" }
				}
			},
			editProfile: async (changes) => {
				try {
					const resp = await getActions().protectedFetch("/profile_edit", "PUT", changes)

					if (!resp.ok) {
						throw new Error("No se pudo actualizar el perfil")
					}

					return await resp.json()

				} catch (error) {
					console.error("Error al actualizar el perfil: ", error)
					throw error
				}
			},
			//ACTIONS PARA EL ENVIO Y LECTURA DE CONSULTAS EXTERNAS
			sendMessage: async (name, lastname, age, phone, consultation, arrival_date) => {
				try {
					const response = await getActions().apiFetch('/message', 'POST', {
						name: name,
						lastname: lastname,
						age: age,
						phone: phone,
						consultation: consultation,
						arrival_date: arrival_date
					});

					if (!response.ok) {
						throw new Error('Failed to send message');
					}
					const responseData = await response.json();
					return responseData;
				} catch (error) {
					console.error("Error al realizar la solicitud:", error);
					throw new Error(`Error de red: ${error.message}`);
				}
			},
			getConsultations: async () => {
				try {
					const response = await getActions().protectedFetch('/consultations', 'GET');
					if (response.ok) {
						const data = await response.json();
						setStore({ consultations: data });
						return data;
					} else {
						throw new Error("Error al obtener las consultas.");
					}
				} catch (error) {
					console.error("Error al obtener las consultas:", error.message);
					throw error;
				}
			},
			getOneConsultation: async (id) => {
				try {
					const resp = await getActions().protectedFetch(`/consultation/${id}`);
					if (resp.ok) {
						const data = await resp.json();
						return data;
					} else {
						throw new Error("Error al obtener el usuario.");
					}
				} catch (error) {
					console.error("Error al obtener usuarios:", error.message);
					throw error;
				}
			},
			changeStatusConsultation: async (id) => {
				try {
					const response = await getActions().protectedFetch(`/consultations/${id}/mark_as_unread`, 'PUT');
					if (response.ok) {
						return response.json();
					} else {
						throw new Error('Error al marcar la consulta como no leída');
					}
				} catch (error) {
					console.error("Error al marcar la consulta como no leída:", error.message);
					throw error;
				}
			},
			markConsultationAsRead: async (id) => {
				try {
					const response = await getActions().protectedFetch(`/consultations/${id}/mark_as_read`, 'PUT');
					if (response.ok) {
						return response.json();
					} else {
						throw new Error('Error al marcar la consulta como no leída');
					}
				} catch (error) {
					console.error("Error al marcar la consulta como no leída:", error.message);
					throw error;
				}
			},
			logicalDeletionMessage: async (id) => {
				try {
					const response = await getActions().protectedFetch(`/deleted_consultations/${id}`, 'PUT');
					if (response.ok) {
						return response;
					} else {
						throw new Error('Error al eliminar el mensaje');
					}
				} catch (error) {
					console.error("Error al eliminar el mensaje:", error.message);
					throw error;
				}
			},
			physicalDeletionMessage: async (id) => {
				try {
					const response = await getActions().protectedFetch(`/deleted_consultations/${id}`, 'DELETE');
					if (response.ok) {
						return response.json();
					} else {
						throw new Error('Error al eliminar el mensaje de forma permanente');
					}
				} catch (error) {
					console.error("Error al eliminar el mensaje:", error.message);
					throw error;
				}
			},
			//ACTIONS PARA MERCADO PAGO
			createPreference: async () => {
				try {
					const response = await getActions().protectedFetch("/create_preference", "POST", {
						description: "Honorarios",
						price: 100,
						quantity: 1,
						currency_id: "ARS"
					})

					if (response.ok) {
						console.log("El response vino ok del back end y tiene esta info: ", response)
						const data = await response.json();
						const { id } = data;
						console.log("Este es el id: ", id)
						let store = getStore()
						setStore({ ...store, preferenceId: id })
						let store2 = getStore()
						console.log("Este es el contenido de id en el store: ", store2.preferenceId.id)
						return id;
					} else {
						console.error("Error creando preferencia.");
					}
				} catch (error) {
					console.error(error);
				}
			},
			getPayments: async () => {
				try {
					const response = await getActions().protectedFetch("/get_payments", 'GET', null)

					if (!response.ok) {
						console.error("Error al traer los pagos.")
					}

					return await response.json()
				} catch (error) {
					console.error("Error: ", error)
				}
			},
			//ACTIONS PARA LA GESTION DE AGENDA
			blockMultipleHours: async (dates) => {
				try {
					const data = {
						dates: dates
					};

					const response = await getActions().apiFetch('/block_multiple_hours', 'POST', data);

					if (response && response.message) {
						console.log('Horas bloqueadas con éxito:', response.message);
					} else {
						console.error('Error al bloquear horas:', response.error);
					}
				} catch (error) {
					console.error('Error al bloquear horas:', error);
				}
			},
			getBlockedDates: async () => {
				try {
					const response = await getActions().apiFetch('/bloquear', 'GET');
					if (response && response.length > 0) {
						console.log('Fechas bloqueadas obtenidas con éxito:', response);
						return response;
					} else {
						console.log('No hay fechas bloqueadas disponibles.');
						return [];
					}
				} catch (error) {
					console.error('Error al obtener fechas bloqueadas:', error);
					throw error;
				}
			},
			fetchUnavailableDates: async () => {
				try {
					const response = await getActions().apiFetch('/fetch_bloquear', 'GET');

					if (!response.ok) {
						throw new Error('Failed to fetch unavailable dates');
					}

					const responseData = await response.json();
					setStore({ unavailableDates: responseData });

					return { success: true, message: 'Unavailable dates fetched successfully' };
				} catch (error) {
					console.error('Error fetching unavailable dates:', error);
					return { success: false, error: error.message || 'Error fetching unavailable dates' };
				}
			},
			addGlobalEnabled: async (data) => {
				try {
					const response = await getActions().apiFetch('/global_enabled', 'POST', data);

					if (!response.ok) {
						throw new Error('Error al agregar disponibilidad global');
					}

					const responseData = await response.json();
					let updatedGlobalEnabled = [];

					if (Array.isArray(responseData)) {
						updatedGlobalEnabled = [...getStore().globalEnabled, ...responseData];
					} else if (typeof responseData === 'object') {
						updatedGlobalEnabled = [...getStore().globalEnabled, responseData];
					}

					setStore({ globalEnabled: updatedGlobalEnabled });
					return responseData;
				} catch (error) {
					console.error("Error al agregar disponibilidad global:", error);
					const errorMessage = error.message || 'Error de red';
					return { success: false, error: errorMessage };
				}
			},
			getGlobalEnabled: async () => {
				try {
					const resp = await getActions().apiFetch('/get_global_enabled', 'GET');
					if (resp.ok) {
						const data = await resp.json();
						setStore({ globalEnabled: data });
						return data;
					} else {
						throw new Error("Error al obtener los datos de disponibilidad global.");
					}
				} catch (error) {
					console.error("Error al obtener los datos de disponibilidad global:", error.message);
					throw error;
				}
			},
			getGlobalEnabledByDay: async (day) => {
				try {
					const resp = await getActions().apiFetch(`/get_global_enabled_by_day/${day}`, 'GET');
					if (resp.ok) {
						const data = await resp.json();
						setStore({ globalEnabledByDay: data });
						return data;
					} else {
						throw new Error("Error al obtener los datos de disponibilidad global por día.");
					}
				} catch (error) {
					console.error("Error al obtener los datos de disponibilidad global por día:", error.message);
					throw error;
				}
			},
			deleteGlobalEnabled: async (id) => {
				try {
					const resp = await getActions().apiFetch(`/delete_global_enabled/${id}`, 'DELETE');
					if (resp.ok) {
						const data = await resp.json();
						const updatedGlobalEnabled = getStore().globalEnabled.filter(item => item.id !== id);
						setStore({ globalEnabled: updatedGlobalEnabled });
						return data;
					} else {
						throw new Error("Error al eliminar el registro de disponibilidad global.");
					}
				} catch (error) {
					console.error("Error al eliminar el registro de disponibilidad global:", error.message);
					throw error;
				}
			},
			fetchUnavailableDates: async () => {
				try {
					const response = await getActions().apiFetch('/fetch_bloquear', 'GET');

					if (!response.ok) {
						throw new Error('Failed to fetch unavailable dates');
					}

					const responseData = await response.json();
					setStore({ unavailableDates: responseData });

					return { success: true, message: 'Unavailable dates fetched successfully' };
				} catch (error) {
					console.error('Error fetching unavailable dates:', error);
					return { success: false, error: error.message || 'Error fetching unavailable dates' };
				}
			},
			//ACTIONS PARA EL TURNERO DEL TERAPEUTA
			getAllReservations: async () => {
				try {
					const response = await getActions().apiFetch('/get_all_reservations', 'GET');

					if (!response.ok) {
						throw new Error('Error al traer las reservas');
					}

					const responseData = await response.json();
					const reservationsData = responseData.data;
					console.log(reservationsData);

					setStore({ reservations: reservationsData });
					return { success: true, message: responseData.message };
				} catch (error) {
					console.error('Error: ', error);
					return { success: false, error: error.message || 'Error al cargar las reservas' };
				}
			},
			updateReservation: async (reservationId, dataToUpdate) => {
				try {
					const response = await getActions().apiFetch(`/edit_reservation/${reservationId}`, 'PUT', dataToUpdate);

					if (!response.ok) {
						throw new Error('Failed to update reservation');
					}

					const responseData = await response.json();
					return { success: true, message: responseData.message, reservation: responseData.reservation };

				} catch (error) {
					console.error("Error:", error);
					return { success: false, error: error.message || 'Error al actualizar la reserva' };
				}
			},
			deleteReservation: async (reservationId) => {
				try {
					const resp = await getActions().apiFetch(`/delete_reservation/${reservationId}`, "DELETE");
					if (!resp.ok) {
						console.error("Error al intentar cancelar la reserva: ", resp);
						return { error: "Error al intentar cancelar la reserva" };
					}
					return { message: "Reserva cancelada exitosamente" };
				} catch (error) {
					console.error("Error al intentar cancelar la reserva: ", error);
					return { error: "Error al intentar cancelar la reserva" };
				}
			},
			searchUserByDNI: async (dni) => {
				try {
					const response = await getActions().apiFetch(`/search_user/${dni}`, 'GET');

					if (!response.ok) {
						throw new Error('Error al buscar usuario por DNI');
					}

					const responseData = await response.json();

					if (responseData.error) {
						throw new Error(responseData.error);
					}

					const userData = responseData;
					setStore({ userByDNI: userData });

					console.log("Datos del usuario recibidos:", userData);

					return { success: true, message: "Usuario encontrado correctamente" };
				} catch (error) {
					console.error('Error al buscar usuario por DNI:', error.message);
					return { success: false, error: error.message };
				}
			},
			postNewDate: async (date, time, userId) => {
				try {
					const body = {
						date: date,
						time: time
					};

					const response = await getActions().apiFetch(`/reservation/${userId}`, 'POST', body);
					console.log(response);
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || 'Error creating reservation.');
					}

					const data = await response.json();
					return data;
				} catch (error) {
					console.error('Error creating reservation:', error);
					throw error;
				}
			},
			createReservationForNonRegisteredUser: async (reservationData) => {
				try {
					const response = await getActions().apiFetch('/reservation/non_registered', 'POST', reservationData);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || 'Failed to create reservation for non-registered user');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					throw new Error(error.message || 'Failed to create reservation for non-registered user');
				}
			},
			//ACTIONS PARA EL TURNERO DEL PACIENTE
			getVirtualLink: async () => {
				try {
					const resp = await getActions().protectedFetch("/profile_virtual_link", "GET", null)
					if (!resp.ok) {
						console.error("Error al traer el link de sala virtual: ", resp)
						return { error: "Error al traer el link de sala virtual" }
					}
					return resp.json()
				} catch (error) {
					console.error("Error: ", error)
					return { error: "Error al traer el link de sala virtual" }
				}
			},
			getPatientReservation: async () => {
				try {
					const resp = await getActions().protectedFetch("/next_reservation", "GET", null)
					if (!resp.ok) {
						console.error("Error consultar el proximo truno: ", resp)
						return { error: "Error consultar el proximo truno" }
					}
					return resp.json()
				} catch (error) {
					console.error("Error: ", error)
					return { error: "Error consultar el proximo truno" }
				}
			},
			createReservation: async (date, time) => {
				try {
					const token = localStorage.getItem("token");
					if (!token) {
						throw new Error("Token not found.");
					}

					const body = {
						date: date,
						time: time
					};

					const response = await getActions().protectedFetch("/reservation", "POST", body);
					const data = await response.json();

					if (!response.ok) {
						throw new Error(data.error || "Error creating reservation.");
					}

					return data;
				} catch (error) {
					console.error("Error creating reservation:", error);
					throw error;
				}
			},
			updateReservation: async (reservationId, dataToUpdate) => {
				try {
					const response = await getActions().apiFetch(`/edit_reservation/${reservationId}`, 'PUT', dataToUpdate);

					if (!response.ok) {
						throw new Error('Failed to update reservation');
					}

					const responseData = await response.json();
					return { success: true, message: responseData.message, reservation: responseData.reservation };

				} catch (error) {
					console.error("Error:", error);
					return { success: false, error: error.message || 'Error al actualizar la reserva' };
				}
			},
			//Funciones para el turnero del terapeuta
			getAllReservations: async () => {
				try {
					const response = await getActions().apiFetch('/get_all_reservations', 'GET');

					if (!response.ok) {
						throw new Error('Error al traer las reservas');
					}

					const responseData = await response.json();
					const reservationsData = responseData.data;
					console.log(reservationsData);

					setStore({ reservations: reservationsData });
					return { success: true, message: responseData.message };
				} catch (error) {
					console.error('Error: ', error);
					return { success: false, error: error.message || 'Error al cargar las reservas' };
				}
			},
			getReservationByID: async (id) => {
				try {
					const response = await getActions().apiFetch(`/get_reservation_by_id/${id}`, 'GET');

					if (!response.ok) {
						throw new Error('Error al traer la reserva');
					}

					const responseData = await response.json();
					const reservationsData = responseData.data;
					console.log(reservationsData);

					setStore({ reservationByID: reservationsData });
					return { success: true, message: responseData.message };
				} catch (error) {
					console.error('Error: ', error);
					return { success: false, error: error.message || 'Error al traer la reserva' };
				}
			},
			searchUserByDNI: async (dni) => {
				try {
					const response = await getActions().apiFetch(`/search_user/${dni}`, 'GET');

					if (!response.ok) {
						throw new Error('Error al buscar usuario por DNI');
					}

					const responseData = await response.json();

					if (responseData.error) {
						throw new Error(responseData.error);
					}

					const userData = responseData;
					setStore({ userByDNI: userData });

					console.log("Datos del usuario recibidos:", userData);

					return { success: true, message: "Usuario encontrado correctamente" };
				} catch (error) {
					console.error('Error al buscar usuario por DNI:', error.message);
					return { success: false, error: error.message };
				}
			},
			postNewDate: async (date, time, user_id) => {
				try {
					const body = {
						date: date,
						time: time
					};

					const response = await fetch(`${process.env.BACKEND_URL}/api/reservation/${user_id}`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						},
						body: JSON.stringify(body)
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || 'Error creating reservation.');
					}

					const data = await response.json();
					return data;
				} catch (error) {
					console.error('Error creating reservation:', error);
					throw error;
				}
			},
			createReservationForNonRegisteredUser: async (reservationData) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}api/reservation/non_registered`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*'
						},
						body: JSON.stringify(reservationData)
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.error || 'Failed to create reservation for non-registered user');
					}

					const responseData = await response.json();
					return responseData;
				} catch (error) {
					throw new Error(error.message || 'Failed to create reservation for non-registered user');
				}
			}
		}
	}
};

export default getState;